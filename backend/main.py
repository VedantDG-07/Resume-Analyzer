import json
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, services, auth
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer API (LangChain + RAG)", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

def format_analysis_response(db_item: models.ResumeAnalysis) -> schemas.ResumeAnalysisResponse:
    # Deserialize JSON fields if they are stored as JSON strings
    bullet_suggestions = []
    if db_item.bullet_suggestions:
        try:
            bullet_suggestions = json.loads(db_item.bullet_suggestions)
        except Exception:
            bullet_suggestions = []

    missing_keywords = []
    if db_item.missing_keywords:
        try:
            missing_keywords = json.loads(db_item.missing_keywords)
        except Exception:
            missing_keywords = []

    strengths = []
    if db_item.strengths:
        try:
            strengths = json.loads(db_item.strengths)
        except Exception:
            strengths = []

    improvements = []
    if db_item.improvements:
        try:
            improvements = json.loads(db_item.improvements)
        except Exception:
            improvements = []

    return schemas.ResumeAnalysisResponse(
        id=db_item.id,
        filename=db_item.filename,
        overall_score=db_item.overall_score,
        ats_score=db_item.ats_score,
        skill_match=db_item.skill_match,
        issues_found=db_item.issues_found,
        ai_summary=db_item.ai_summary,
        ats_feedback=db_item.ats_feedback,
        action_verb_feedback=db_item.action_verb_feedback,
        bullet_suggestions=bullet_suggestions,
        missing_keywords=missing_keywords,
        strengths=strengths,
        improvements=improvements,
        created_at=db_item.created_at
    )

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AI Resume Analyzer API",
        "engine": "LangChain + Gemini RAG v2.0",
        "status": "online"
    }

@app.post("/api/analyze", response_model=schemas.ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_bytes = await file.read()
    
    # 1. Extract text
    text = services.extract_text(file_bytes, file.filename)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract readable text from uploaded file.")
    
    # 2. Run LangChain + RAG Pipeline
    analysis_data = services.analyze_resume_with_rag(text)
    
    # 3. Save to database
    db_analysis = models.ResumeAnalysis(
        filename=file.filename,
        overall_score=analysis_data.get("overall_score", 75),
        ats_score=analysis_data.get("ats_score", 80),
        skill_match=analysis_data.get("skill_match", 70),
        issues_found=analysis_data.get("issues_found", 2),
        ai_summary=analysis_data.get("ai_summary", ""),
        ats_feedback=analysis_data.get("ats_feedback", ""),
        action_verb_feedback=analysis_data.get("action_verb_feedback", ""),
        bullet_suggestions=json.dumps(analysis_data.get("bullet_suggestions", [])),
        missing_keywords=json.dumps(analysis_data.get("missing_keywords", [])),
        strengths=json.dumps(analysis_data.get("strengths", [])),
        improvements=json.dumps(analysis_data.get("improvements", [])),
        user_id=current_user.id
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return format_analysis_response(db_analysis)

@app.get("/api/analyses", response_model=List[schemas.ResumeAnalysisResponse])
def get_analyses(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    analyses = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.user_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).offset(skip).limit(limit).all()
    return [format_analysis_response(a) for a in analyses]
