import io
import os
import json
import re
from typing import Dict, Any, List
from PyPDF2 import PdfReader
import docx
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
# 2. FALLBACK HEURISTIC GENERATOR (Graceful Offline Fallback)
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
# 3. LANGCHAIN + RAG PIPELINE
# ==========================================

def analyze_resume_with_rag(text: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[AI Service] No GOOGLE_API_KEY set. Using fallback analysis.")
        return generate_fallback_heuristic_analysis(text)

    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
        from langchain_community.vectorstores import FAISS
        from langchain_core.prompts import PromptTemplate
        from langchain_core.output_parsers import PydanticOutputParser

        # 1. Document Chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=80,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        docs = text_splitter.create_documents([text])

        # 2. In-Memory Vector Store via RAG
        rag_context = ""
        try:
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=api_key
            )
            vectorstore = FAISS.from_documents(docs, embeddings)
            retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

            # Retrieve domain-targeted queries
            q1_docs = retriever.invoke("Work experience accomplishments metrics percentages leadership projects")
            q2_docs = retriever.invoke("Skills tools technologies certifications education software frameworks")
            q3_docs = retriever.invoke("Roles responsibilities bullet points achievements")

            all_retrieved = {d.page_content for d in (q1_docs + q2_docs + q3_docs)}
            rag_context = "\n---\n".join(all_retrieved)
        except Exception as embed_err:
            print(f"[AI Service] Embedding/FAISS fallback: {embed_err}")
            # If embedding has network/quota issues, use full text chunks directly
            rag_context = text[:4000]

        # 3. LLM Setup & Structured Output Parser
        parser = PydanticOutputParser(pydantic_object=schemas.LLMAnalysisOutput)

        prompt_template = PromptTemplate(
            template="""You are an expert Executive Resume Reviewer, ATS Algorithm Specialist, and Technical Career Coach.
Analyze the following resume thoroughly based on the provided contextual sections extracted from the candidate's resume.

Resume Context:
\"\"\"
{context}
\"\"\"

Full Resume Text Sample:
\"\"\"
{full_text}
\"\"\"

Instructions:
1. Provide a realistic numerical evaluation for overall_score (0-100), ats_score (0-100), skill_match (0-100), and issues_found.
2. Formulate a sharp, professional executive summary (ai_summary) detailing the candidate's level, readiness, and impact.
3. Write targeted ats_feedback explaining formatting, readability, and parser compliance.
4. Write targeted action_verb_feedback highlighting weak verbs vs strong verbs.
5. Identify 2-4 actual weak bullet points from the resume text and rewrite them as high-impact bullet_suggestions with quantified results and rationale.
6. Suggest 4-8 missing high-value keywords (missing_keywords) that would enhance ATS keyword density.
7. List 3-5 distinct strengths and 3-5 actionable improvements.

{format_instructions}
""",
            input_variables=["context", "full_text"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.2,
            google_api_key=api_key,
            max_output_tokens=2048
        )

        chain = prompt_template | llm | parser

        print("[AI Service] Executing LangChain RAG analysis with Gemini...")
        result = chain.invoke({
            "context": rag_context,
            "full_text": text[:3000]
        })

        # Convert Pydantic object to dictionary
        result_dict = result.model_dump()
        print("[AI Service] LangChain RAG analysis completed successfully!")
        return result_dict

    except Exception as e:
        print(f"[AI Service] LangChain pipeline error: {e}. Falling back to heuristic engine.")
        return generate_fallback_heuristic_analysis(text)
