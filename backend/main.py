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

    parsed_ats_data = []
    if db_item.parsed_ats_data:
        try:
            parsed_ats_data = json.loads(db_item.parsed_ats_data)
        except Exception:
            parsed_ats_data = []

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
        parsed_ats_data=parsed_ats_data,
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
        parsed_ats_data=json.dumps(analysis_data.get("parsed_ats_data", [])),
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

@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_analysis = db.query(models.ResumeAnalysis).filter(
        models.ResumeAnalysis.id == analysis_id,
        models.ResumeAnalysis.user_id == current_user.id
    ).first()
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    db.delete(db_analysis)
    db.commit()
    return {"message": "Analysis deleted successfully"}

@app.post("/api/interview/generate", response_model=schemas.InterviewPrepResponse)
def generate_interview(request: schemas.InterviewGenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_analysis = db.query(models.ResumeAnalysis).filter(
        models.ResumeAnalysis.id == request.analysis_id,
        models.ResumeAnalysis.user_id == current_user.id
    ).first()
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")
        
    analysis_obj = format_analysis_response(db_analysis)
    try:
        questions = services.generate_interview_questions(analysis_obj)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/roadmap/generate", response_model=schemas.SkillRoadmapResponse)
def generate_roadmap(request: schemas.RoadmapGenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_analysis = db.query(models.ResumeAnalysis).filter(
        models.ResumeAnalysis.id == request.analysis_id,
        models.ResumeAnalysis.user_id == current_user.id
    ).first()
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")

    target_role = request.target_role or "Software Engineer" # Default fallback
    
    analysis_obj = format_analysis_response(db_analysis)
    
    try:
        roadmap_data = services.generate_skill_roadmap_data(analysis_obj, target_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    db_roadmap = db.query(models.SkillRoadmap).filter(
        models.SkillRoadmap.analysis_id == request.analysis_id,
        models.SkillRoadmap.user_id == current_user.id
    ).first()

    if db_roadmap:
        # Update existing
        db_roadmap.target_role = target_role
        db_roadmap.match_score = roadmap_data.get("match_score", 0)
        db_roadmap.roadmap_data = json.dumps(roadmap_data.get("phases", []))
    else:
        # Create new
        db_roadmap = models.SkillRoadmap(
            user_id=current_user.id,
            analysis_id=request.analysis_id,
            target_role=target_role,
            match_score=roadmap_data.get("match_score", 0),
            roadmap_data=json.dumps(roadmap_data.get("phases", []))
        )
        db.add(db_roadmap)
    
    db.commit()
    db.refresh(db_roadmap)

    return roadmap_data

@app.get("/api/roadmap/{analysis_id}", response_model=schemas.SkillRoadmapResponse)
def get_roadmap(analysis_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_roadmap = db.query(models.SkillRoadmap).filter(
        models.SkillRoadmap.analysis_id == analysis_id,
        models.SkillRoadmap.user_id == current_user.id
    ).order_by(models.SkillRoadmap.created_at.desc()).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    phases = []
    if db_roadmap.roadmap_data:
        try:
            phases = json.loads(db_roadmap.roadmap_data)
        except Exception:
            phases = []
            
    return schemas.SkillRoadmapResponse(
        target_role=db_roadmap.target_role,
        match_score=db_roadmap.match_score,
        phases=phases
    )

@app.post("/api/roadmap/progress", response_model=schemas.SkillRoadmapResponse)
def update_roadmap_progress(request: schemas.RoadmapProgressRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_roadmap = db.query(models.SkillRoadmap).filter(
        models.SkillRoadmap.id == request.roadmap_id,
        models.SkillRoadmap.user_id == current_user.id
    ).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    phases = []
    if db_roadmap.roadmap_data:
        try:
            phases = json.loads(db_roadmap.roadmap_data)
        except Exception:
            phases = []
            
    # Update the skill status
    updated = False
    for phase in phases:
        for skill in phase.get("skills", []):
            if skill.get("name") == request.skill_name:
                skill["status"] = request.new_status
                updated = True
                break
        if updated:
            break
            
    if updated:
        db_roadmap.roadmap_data = json.dumps(phases)
        db.commit()
        db.refresh(db_roadmap)
        
    return schemas.SkillRoadmapResponse(
        target_role=db_roadmap.target_role,
        match_score=db_roadmap.match_score,
        phases=phases
    )
