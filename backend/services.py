import io
from PyPDF2 import PdfReader
import docx
import random

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
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

import re

def generate_mock_analysis(text: str) -> dict:
    """
    Generate an accurate score based on actual text analysis (heuristics).
    This looks for sections, action verbs, and numbers (quantifiable impact).
    """
    if not text.strip():
        return {
            "overall_score": 0,
            "ats_score": 0,
            "skill_match": 0,
            "issues_found": 5
        }
        
    text_lower = text.lower()
    words = text_lower.split()
    word_count = len(words)
    
    # 1. Check for standard sections
    sections = ['experience', 'education', 'skills', 'projects', 'summary', 'objective']
    found_sections = [sec for sec in sections if sec in text_lower]
    section_score = (len(found_sections) / 4) * 100  # Cap at 4 sections for max score
    
    # 2. Check for action verbs
    action_verbs = ['developed', 'managed', 'created', 'led', 'designed', 'implemented', 'improved', 'increased', 'reduced', 'optimized', 'spearheaded', 'orchestrated']
    found_verbs = [verb for verb in action_verbs if verb in text_lower]
    verb_score = (len(found_verbs) / 5) * 100 # Cap at 5 strong verbs for max score
    
    # 3. Check for quantifiable metrics (numbers, %, $)
    has_numbers = bool(re.search(r'\d+', text))
    has_percentages = bool(re.search(r'\d+%', text))
    has_currency = bool(re.search(r'\$\d+', text))
    
    metrics_score = 0
    if has_numbers: metrics_score += 40
    if has_percentages: metrics_score += 30
    if has_currency: metrics_score += 30
    
    # 4. Length optimization (ideally 300 - 800 words)
    length_score = 100
    if word_count < 200:
        length_score = 50
    elif word_count > 1000:
        length_score = 70
        
    # Calculate final scores
    overall_score = (section_score * 0.3) + (verb_score * 0.3) + (metrics_score * 0.2) + (length_score * 0.2)
    ats_score = (section_score * 0.6) + (length_score * 0.4)
    skill_match = (verb_score * 0.4) + (section_score * 0.6) # Proxy for skills
    
    # Ensure scores are within 0-100
    overall_score = min(max(overall_score, 15), 98)
    ats_score = min(max(ats_score, 20), 99)
    skill_match = min(max(skill_match, 10), 95)
    
    # Calculate issues found
    issues_found = 0
    if len(found_sections) < 3: issues_found += 1
    if len(found_verbs) < 3: issues_found += 1
    if not has_numbers: issues_found += 1
    if word_count < 200 or word_count > 1000: issues_found += 1
    if not (has_percentages or has_currency): issues_found += 1
    
    return {
        "overall_score": round(overall_score, 1),
        "ats_score": round(ats_score, 1),
        "skill_match": round(skill_match, 1),
        "issues_found": issues_found
    }
