import json
from datetime import datetime
from typing import List, Union, Optional
from bson import ObjectId
from pymongo import DESCENDING

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from fastapi.responses import JSONResponse
from fastapi import Request

import models, schemas, services, auth
from database import (
    init_db,
    analyses_collection,
    roadmaps_collection,
    DATABASE_URL
)

# Initialize indexes
init_db()

app = FastAPI(title="AI Resume Analyzer API (MongoDB + LangChain + RAG)", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": f"Database Error: Could not connect to MongoDB ({DATABASE_URL}). Please verify your MongoDB server is running or configure DATABASE_URL in backend/.env."
        }
    )

app.include_router(auth.router)

def format_analysis_response(doc: dict) -> schemas.ResumeAnalysisResponse:
    if not doc:
        return None

    # Handle string or ObjectId id
    doc_id = str(doc.get("_id") or doc.get("id") or "")
    
    # Handle list fields (parse JSON string if stored as string, else use list)
    def parse_list_field(val):
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return []
        return []

    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except Exception:
            created_at = datetime.utcnow()
    elif not isinstance(created_at, datetime):
        created_at = datetime.utcnow()

    return schemas.ResumeAnalysisResponse(
        id=doc_id,
        filename=doc.get("filename", "resume.pdf"),
        overall_score=float(doc.get("overall_score", 0)),
        ats_score=float(doc.get("ats_score", 0)),
        skill_match=float(doc.get("skill_match", 0)),
        issues_found=int(doc.get("issues_found", 0)),
        ai_summary=doc.get("ai_summary"),
        ats_feedback=doc.get("ats_feedback"),
        action_verb_feedback=doc.get("action_verb_feedback"),
        bullet_suggestions=parse_list_field(doc.get("bullet_suggestions")),
        missing_keywords=parse_list_field(doc.get("missing_keywords")),
        strengths=parse_list_field(doc.get("strengths")),
        improvements=parse_list_field(doc.get("improvements")),
        parsed_ats_data=parse_list_field(doc.get("parsed_ats_data")),
        created_at=created_at
    )

def query_analysis_by_id(analysis_id: Union[str, int], user_id: str) -> Optional[dict]:
    """Helper to query analysis document supporting ObjectId or string/int ID."""
    obj_id = models.to_object_id(analysis_id)
    query_filters = [{"user_id": str(user_id)}]
    
    if obj_id:
        id_query = {"$or": [{"_id": obj_id}, {"_id": str(analysis_id)}, {"id": analysis_id}]}
    else:
        id_query = {"$or": [{"_id": str(analysis_id)}, {"id": analysis_id}]}
        
    return analyses_collection.find_one({"$and": [id_query, {"user_id": str(user_id)}]})

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AI Resume Analyzer API",
        "database": "MongoDB",
        "engine": "LangChain + Gemini RAG v2.0",
        "status": "online"
    }

@app.post("/api/analyze", response_model=schemas.ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...), 
    current_user: dict = Depends(auth.get_current_user)
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
    
    # 3. Save to MongoDB
    now = datetime.utcnow()
    new_analysis = {
        "filename": file.filename,
        "overall_score": analysis_data.get("overall_score", 75),
        "ats_score": analysis_data.get("ats_score", 80),
        "skill_match": analysis_data.get("skill_match", 70),
        "issues_found": analysis_data.get("issues_found", 2),
        "ai_summary": analysis_data.get("ai_summary", ""),
        "ats_feedback": analysis_data.get("ats_feedback", ""),
        "action_verb_feedback": analysis_data.get("action_verb_feedback", ""),
        "bullet_suggestions": analysis_data.get("bullet_suggestions", []),
        "missing_keywords": analysis_data.get("missing_keywords", []),
        "strengths": analysis_data.get("strengths", []),
        "improvements": analysis_data.get("improvements", []),
        "parsed_ats_data": analysis_data.get("parsed_ats_data", []),
        "user_id": str(current_user["id"]),
        "created_at": now,
        "updated_at": now
    }
    
    result = analyses_collection.insert_one(new_analysis)
    new_analysis["_id"] = result.inserted_id
    
    return format_analysis_response(new_analysis)

@app.get("/api/analyses", response_model=List[schemas.ResumeAnalysisResponse])
def get_analyses(
    skip: int = 0, 
    limit: int = 10, 
    current_user: dict = Depends(auth.get_current_user)
):
    analyses = list(
        analyses_collection.find({"user_id": str(current_user["id"])})
        .sort("created_at", DESCENDING)
        .skip(skip)
        .limit(limit)
    )
    return [format_analysis_response(a) for a in analyses]

@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(
    analysis_id: str, 
    current_user: dict = Depends(auth.get_current_user)
):
    db_analysis = query_analysis_by_id(analysis_id, current_user["id"])
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Delete analysis document
    analyses_collection.delete_one({"_id": db_analysis["_id"]})
    
    # Cascade delete related skill roadmaps
    roadmaps_collection.delete_many({
        "$or": [
            {"analysis_id": str(db_analysis["_id"])},
            {"analysis_id": str(analysis_id)}
        ],
        "user_id": str(current_user["id"])
    })
    
    return {"message": "Analysis deleted successfully"}

@app.post("/api/interview/generate", response_model=schemas.InterviewPrepResponse)
def generate_interview(
    request: schemas.InterviewGenerateRequest, 
    current_user: dict = Depends(auth.get_current_user)
):
    db_analysis = query_analysis_by_id(request.analysis_id, current_user["id"])
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")
        
    analysis_obj = format_analysis_response(db_analysis)
    try:
        questions = services.generate_interview_questions(analysis_obj)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/roadmap/generate", response_model=schemas.SkillRoadmapResponse)
def generate_roadmap(
    request: schemas.RoadmapGenerateRequest, 
    current_user: dict = Depends(auth.get_current_user)
):
    db_analysis = query_analysis_by_id(request.analysis_id, current_user["id"])
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Resume analysis not found")

    target_role = request.target_role or "Software Engineer" # Default fallback
    analysis_obj = format_analysis_response(db_analysis)
    
    try:
        roadmap_data = services.generate_skill_roadmap_data(analysis_obj, target_role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    now = datetime.utcnow()
    analysis_id_str = str(db_analysis["_id"])
    
    # Check if roadmap exists for this analysis and user
    db_roadmap = roadmaps_collection.find_one({
        "$or": [
            {"analysis_id": analysis_id_str},
            {"analysis_id": str(request.analysis_id)}
        ],
        "user_id": str(current_user["id"])
    })

    phases = roadmap_data.get("phases", [])

    if db_roadmap:
        roadmaps_collection.update_one(
            {"_id": db_roadmap["_id"]},
            {"$set": {
                "target_role": target_role,
                "match_score": roadmap_data.get("match_score", 0),
                "phases": phases,
                "updated_at": now
            }}
        )
        roadmap_id_str = str(db_roadmap["_id"])
    else:
        new_roadmap = {
            "user_id": str(current_user["id"]),
            "analysis_id": analysis_id_str,
            "target_role": target_role,
            "match_score": roadmap_data.get("match_score", 0),
            "phases": phases,
            "created_at": now,
            "updated_at": now
        }
        res = roadmaps_collection.insert_one(new_roadmap)
        roadmap_id_str = str(res.inserted_id)

    return schemas.SkillRoadmapResponse(
        id=roadmap_id_str,
        target_role=target_role,
        match_score=roadmap_data.get("match_score", 0),
        phases=phases
    )

@app.get("/api/roadmap/{analysis_id}", response_model=schemas.SkillRoadmapResponse)
def get_roadmap(
    analysis_id: str, 
    current_user: dict = Depends(auth.get_current_user)
):
    obj_id = models.to_object_id(analysis_id)
    query_or = [{"analysis_id": str(analysis_id)}]
    if obj_id:
        query_or.append({"analysis_id": str(obj_id)})
        
    db_roadmap = roadmaps_collection.find_one(
        {"$and": [{"$or": query_or}, {"user_id": str(current_user["id"])}]},
        sort=[("created_at", DESCENDING)]
    )
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    phases = db_roadmap.get("phases", [])
    if isinstance(phases, str):
        try:
            phases = json.loads(phases)
        except Exception:
            phases = []

    return schemas.SkillRoadmapResponse(
        id=str(db_roadmap.get("_id", "")),
        target_role=db_roadmap.get("target_role", "Software Engineer"),
        match_score=float(db_roadmap.get("match_score", 0)),
        phases=phases
    )

@app.post("/api/roadmap/progress", response_model=schemas.SkillRoadmapResponse)
def update_roadmap_progress(
    request: schemas.RoadmapProgressRequest, 
    current_user: dict = Depends(auth.get_current_user)
):
    obj_id = models.to_object_id(request.roadmap_id)
    id_filter = {"$or": [{"_id": obj_id}, {"_id": str(request.roadmap_id)}]} if obj_id else {"_id": str(request.roadmap_id)}
    
    db_roadmap = roadmaps_collection.find_one({
        "$and": [id_filter, {"user_id": str(current_user["id"])}]
    })
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    phases = db_roadmap.get("phases", [])
    if isinstance(phases, str):
        try:
            phases = json.loads(phases)
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
        roadmaps_collection.update_one(
            {"_id": db_roadmap["_id"]},
            {"$set": {
                "phases": phases,
                "updated_at": datetime.utcnow()
            }}
        )
        
    return schemas.SkillRoadmapResponse(
        id=str(db_roadmap.get("_id", "")),
        target_role=db_roadmap.get("target_role", "Software Engineer"),
        match_score=float(db_roadmap.get("match_score", 0)),
        phases=phases
    )

@app.post("/api/job-match", response_model=schemas.JDMatchResponse)
def job_match(
    request: schemas.JDMatchRequest, 
    current_user: dict = Depends(auth.get_current_user)
):
    # If analysis_id is provided, use it; otherwise get the latest analysis
    if request.analysis_id:
        db_analysis = query_analysis_by_id(request.analysis_id, current_user["id"])
    else:
        db_analysis = analyses_collection.find_one(
            {"user_id": str(current_user["id"])},
            sort=[("created_at", DESCENDING)]
        )
    
    if not db_analysis:
        raise HTTPException(status_code=404, detail="No resume analysis found. Please upload and analyze a resume first.")
    
    analysis_obj = format_analysis_response(db_analysis)
    
    try:
        result = services.match_job_description(
            resume_analysis=analysis_obj,
            job_title=request.job_title or "",
            job_description=request.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
