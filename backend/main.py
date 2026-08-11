from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, services, auth
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}

@app.post("/api/analyze", response_model=schemas.ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_bytes = await file.read()
    
    # Extract text and generate mock analysis
    text = services.extract_text(file_bytes, file.filename)
    analysis_data = services.generate_mock_analysis(text)
    
    # Save to database
    db_analysis = models.ResumeAnalysis(
        filename=file.filename,
        overall_score=analysis_data["overall_score"],
        ats_score=analysis_data["ats_score"],
        skill_match=analysis_data["skill_match"],
        issues_found=analysis_data["issues_found"],
        user_id=current_user.id
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis

@app.get("/api/analyses", response_model=List[schemas.ResumeAnalysisResponse])
def get_analyses(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    analyses = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.user_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).offset(skip).limit(limit).all()
    return analyses
