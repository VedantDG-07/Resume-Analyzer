import io
import os
import json
import re
from typing import Dict, Any, List
from PyPDF2 import PdfReader
import docx
import requests
from dotenv import load_dotenv

import schemas

load_dotenv()

# ==========================================
# 1. DOCUMENT TEXT EXTRACTION
# ==========================================

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs if para.text])
        return text
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith('.docx'):
        return extract_text_from_docx(file_bytes)
    return ""

# ==========================================
# 2. ROBUST TEXT CHUNKER (Built-in + LangChain)
# ==========================================

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 80) -> List[str]:
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return [doc.page_content for doc in splitter.create_documents([text])]
    except Exception:
        pass

    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return [doc.page_content for doc in splitter.create_documents([text])]
    except Exception:
        pass

    # Native Python semantic chunker
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks = []
    current_chunk = ""
    for p in paragraphs:
        if len(current_chunk) + len(p) < chunk_size:
            current_chunk += "\n" + p
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks if chunks else [text]

# ==========================================
# 3. MULTI-MODEL GEMINI INVOCATION ENGINE
# ==========================================

ACTIVE_GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemma-4-26b-a4b-it"
]

def _call_gemini_with_fallback(api_key: str, prompt: str) -> str:
    """Tries active Gemini models with automatic fallback if one is busy (503/429)."""
    last_err = None
    for model_name in ACTIVE_GEMINI_MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}
            }
            resp = requests.post(url, json=payload, timeout=25)
            if resp.status_code == 200:
                data = resp.json()
                cand = data.get("candidates", [{}])[0]
                text = cand.get("content", {}).get("parts", [{}])[0].get("text", "")
                if text.strip():
                    print(f"[AI Service] Successfully generated insights using {model_name}")
                    return text
            else:
                print(f"[AI Service] Model {model_name} returned status {resp.status_code}")
                last_err = f"Status {resp.status_code}: {resp.text[:120]}"
        except Exception as e:
            print(f"[AI Service] Model {model_name} error: {e}")
            last_err = str(e)
            
    raise RuntimeError(f"All Gemini models exhausted. Last error: {last_err}")

# ==========================================
# 4. JSON RESPONSE PARSER & CLEANER
# ==========================================

def _clean_and_parse_json(raw_text: str) -> Dict[str, Any]:
    cleaned = raw_text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1:
        cleaned = cleaned[first_brace:last_brace + 1]

    return json.loads(cleaned)

# ==========================================
# 5. FALLBACK HEURISTIC GENERATOR
# ==========================================

def generate_fallback_heuristic_analysis(text: str) -> Dict[str, Any]:
    if not text.strip():
        return {
            "overall_score": 0,
            "ats_score": 0,
            "skill_match": 0,
            "issues_found": 5,
            "ai_summary": "Empty resume file uploaded. No text could be extracted.",
            "ats_feedback": "Document contains no readable text layers. Ensure standard PDF/DOCX export.",
            "action_verb_feedback": "No action verbs detected.",
            "bullet_suggestions": [],
            "missing_keywords": ["Experience", "Skills", "Education", "Projects"],
            "strengths": [],
            "improvements": ["Upload a non-empty, text-searchable resume file."]
        }
        
    text_lower = text.lower()
    words = text_lower.split()
    word_count = len(words)
    
    sections = ['experience', 'education', 'skills', 'projects', 'summary', 'objective']
    found_sections = [sec for sec in sections if sec in text_lower]
    section_score = min(100, (len(found_sections) / 4) * 100)
    
    action_verbs = ['developed', 'managed', 'created', 'led', 'designed', 'implemented', 'improved', 'increased', 'reduced', 'optimized', 'spearheaded', 'orchestrated']
    found_verbs = [verb for verb in action_verbs if verb in text_lower]
    verb_score = min(100, (len(found_verbs) / 5) * 100)
    
    has_numbers = bool(re.search(r'\d+', text))
    has_percentages = bool(re.search(r'\d+%', text))
    has_currency = bool(re.search(r'\$\d+', text))
    
    metrics_score = 0
    if has_numbers: metrics_score += 40
    if has_percentages: metrics_score += 30
    if has_currency: metrics_score += 30
    
    length_score = 100
    if word_count < 200: length_score = 50
    elif word_count > 1000: length_score = 70
        
    overall_score = round(min(max((section_score * 0.3) + (verb_score * 0.3) + (metrics_score * 0.2) + (length_score * 0.2), 20), 96), 1)
    ats_score = round(min(max((section_score * 0.6) + (length_score * 0.4), 25), 98), 1)
    skill_match = round(min(max((verb_score * 0.4) + (section_score * 0.6), 20), 95), 1)
    
    issues_count = 0
    if len(found_sections) < 4: issues_count += 1
    if len(found_verbs) < 4: issues_count += 1
    if not has_numbers: issues_count += 1
    if word_count < 250 or word_count > 900: issues_count += 1
    if not (has_percentages or has_currency): issues_count += 1

    return {
        "overall_score": overall_score,
        "ats_score": ats_score,
        "skill_match": skill_match,
        "issues_found": max(issues_count, 1),
        "ai_summary": f"Resume analysis extracted {word_count} words across key sections ({', '.join(found_sections) if found_sections else 'general'}). The document showcases relevant background but would benefit from greater metric quantification and targeted keyword expansion.",
        "ats_feedback": f"Standard section headers detected: {len(found_sections)}/6. Ensure clean single-column hierarchy for optimal ATS parsing.",
        "action_verb_feedback": f"Found {len(found_verbs)} high-impact action verbs. Aim to start every bullet with strong velocity verbs like 'Architected', 'Spearheaded', or 'Optimized'.",
        "bullet_suggestions": [
            {
                "original": "Responsible for managing tasks and working with the engineering team.",
                "improved": "Spearheaded Agile sprint execution with 6 engineers, accelerating feature shipping cadence by 30%.",
                "reason": "Replaces passive duty statement with quantified business impact."
            }
        ],
        "missing_keywords": ["CI/CD Pipelines", "System Architecture", "KPI Tracking", "Cross-Functional Leadership"],
        "strengths": [
            f"Clear section division with {len(found_sections)} standard resume sections.",
            "Adequate overall word count volume for scanning.",
            "Logical chronological presentation."
        ],
        "improvements": [
            "Add quantifiable business metrics (%, $, volume) to every project bullet.",
            "Incorporate more industry-specific technical keywords.",
            "Replace passive phrasing with active leadership verbs."
        ]
    }

# ==========================================
# 6. MAIN RAG + GEMINI LLM ANALYSIS PIPELINE
# ==========================================

def analyze_resume_with_rag(text: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        print("[AI Service] No GOOGLE_API_KEY set in backend/.env. Using fallback analysis.")
        return generate_fallback_heuristic_analysis(text)

    # 1. Chunk document
    chunks = chunk_text(text, chunk_size=500, chunk_overlap=80)

    # 2. Vector Retrieval (RAG)
    rag_context = ""
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        from langchain_community.vectorstores import FAISS
        from langchain_core.documents import Document

        doc_objs = [Document(page_content=c) for c in chunks]
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
        vectorstore = FAISS.from_documents(doc_objs, embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

        q1 = retriever.invoke("Work experience accomplishments metrics percentages leadership")
        q2 = retriever.invoke("Skills technical tools technologies certifications education")
        q3 = retriever.invoke("Key projects bullet points achievements responsibilities")

        all_retrieved = {d.page_content for d in (q1 + q2 + q3)}
        rag_context = "\n---\n".join(all_retrieved)
        print("[AI Service] RAG vector context retrieved successfully via FAISS.")
    except Exception as rag_err:
        print(f"[AI Service] RAG vector retrieval note: {rag_err}. Using context chunks.")
        rag_context = "\n---\n".join(chunks[:6])

    # 3. Formulate Prompt
    analysis_prompt = f"""You are an elite Executive Resume Reviewer, ATS Algorithm Specialist, and Technical Hiring Manager.
Analyze the candidate's resume thoroughly using the extracted context below.

Resume Sections Context:
\"\"\"
{rag_context}
\"\"\"

Full Resume Text Sample:
\"\"\"
{text[:3500]}
\"\"\"

Analyze the resume and return a STRICT, VALID JSON object with the exact keys below. Do NOT output any preamble or extra text.

JSON Schema:
{{
  "overall_score": <number between 0 and 100>,
  "ats_score": <number between 0 and 100>,
  "skill_match": <number between 0 and 100>,
  "issues_found": <integer count of issues>,
  "ai_summary": "<Detailed executive summary evaluating profile strength, career readiness, and competitive edge>",
  "ats_feedback": "<Specific feedback on layout, formatting, headers, and parsing readability>",
  "action_verb_feedback": "<Critique on action verb velocity and proactive achievement phrasing>",
  "bullet_suggestions": [
    {{
      "original": "<A real weak or passive line found in the resume>",
      "improved": "<High-impact rewritten bullet with strong action verb and quantified metric/results>",
      "reason": "<Why this change is stronger>"
    }},
    {{
      "original": "<Second weak bullet from resume>",
      "improved": "<Second high-impact rewrite>",
      "reason": "<Rationale>"
    }}
  ],
  "missing_keywords": ["<Keyword 1>", "<Keyword 2>", "<Keyword 3>", "<Keyword 4>", "<Keyword 5>"],
  "strengths": [
    "<Strength 1>",
    "<Strength 2>",
    "<Strength 3>"
  ],
  "improvements": [
    "<Actionable Improvement 1>",
    "<Actionable Improvement 2>",
    "<Actionable Improvement 3>"
  ]
}}
"""

    # 4. Invoke LLM with fallback
    try:
        print("[AI Service] Invoking Gemini LLM for resume analysis...")
        raw_response = _call_gemini_with_fallback(api_key, analysis_prompt)
        parsed_data = _clean_and_parse_json(raw_response)

        # Validate with Pydantic
        validated = schemas.LLMAnalysisOutput(**parsed_data)
        print("[AI Service] Gemini LLM analysis completed and validated successfully!")
        return validated.model_dump()

    except Exception as llm_err:
        print(f"[AI Service] LLM generation error: {llm_err}. Falling back to heuristic engine.")
        return generate_fallback_heuristic_analysis(text)
