from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Any, Union

class UserBase(BaseModel):
    email: str
    fullName: str
    profilePicture: Optional[str] = None
    provider: str = "Google"

class UserCreate(UserBase):
    googleId: str
    emailVerified: bool = False

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BulletSuggestion(BaseModel):
    original: str = Field(description="The weak or passive bullet point found in the resume")
    improved: str = Field(description="The AI-optimized, high-impact bullet point with strong action verbs and quantified results")
    reason: str = Field(description="Brief rationale of why this rewrite is stronger")

class ATSParsedField(BaseModel):
    field: str = Field(description="The name of the field (e.g., First Name, Last Name, Email, Phone, LinkedIn URL, Education (Degree), Graduation Year)")
    status: str = Field(description="'found' if present, 'not_found' if missing")
    value: str = Field(description="The extracted value or 'Missing'")

class LLMAnalysisOutput(BaseModel):
    overall_score: float = Field(description="Overall resume quality score between 0 and 100")
    ats_score: float = Field(description="ATS compatibility score between 0 and 100")
    skill_match: float = Field(description="Skill depth and relevance score between 0 and 100")
    issues_found: int = Field(description="Count of critical issues needing attention")
    ai_summary: str = Field(description="Comprehensive executive summary evaluating candidate profile, clarity, and market readiness")
    ats_feedback: str = Field(description="Specific feedback on ATS readability, section headings, and layout structure")
    action_verb_feedback: str = Field(description="Critique of action verb velocity and impact phrasing")
    bullet_suggestions: List[BulletSuggestion] = Field(description="Top 2 to 4 bullet points rewritten for maximum impact", default_factory=list)
    missing_keywords: List[str] = Field(description="List of 4-8 recommended high-value technical/industry keywords missing from the resume", default_factory=list)
    strengths: List[str] = Field(description="List of 3-5 strongest elements identified in the resume", default_factory=list)
    improvements: List[str] = Field(description="List of 3-5 high-priority concrete improvement recommendations", default_factory=list)
    parsed_ats_data: List[ATSParsedField] = Field(description="List of extracted ATS fields and their status", default_factory=list)

class ResumeAnalysisBase(BaseModel):
    filename: str
    overall_score: float
    ats_score: float
    skill_match: float
    issues_found: int
    ai_summary: Optional[str] = None
    ats_feedback: Optional[str] = None
    action_verb_feedback: Optional[str] = None
    bullet_suggestions: Optional[List[BulletSuggestion]] = None
    missing_keywords: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    parsed_ats_data: Optional[List[ATSParsedField]] = None

class ResumeAnalysisCreate(ResumeAnalysisBase):
    pass

class ResumeAnalysisResponse(ResumeAnalysisBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionItem(BaseModel):
    type: str = Field(description="The type of the question: 'resume_project', 'technical', or 'job_role'")
    question: str = Field(description="The interview question")
    reason: str = Field(description="A short explanation of why this question was asked")

class InterviewPrepResponse(BaseModel):
    questions: List[QuestionItem] = Field(description="A list of exactly 3 interview questions")

class InterviewGenerateRequest(BaseModel):
    analysis_id: Union[str, int]

class RoadmapSkill(BaseModel):
    name: str = Field(description="The name of the skill to learn")
    priority: str = Field(description="'HIGH', 'MEDIUM', or 'LOW'")
    status: str = Field(description="'Not Started', 'In Progress', or 'Completed'")
    rationale: str = Field(description="Why this skill matters for the target role")
    prerequisites: List[str] = Field(description="List of prerequisite skills")
    estimated_time: str = Field(description="Estimated time to learn, e.g., '2 weeks'")
    project_suggestion: str = Field(description="A practical project suggestion to master this skill")

class RoadmapPhase(BaseModel):
    phase: int = Field(description="Phase number, e.g. 1")
    title: str = Field(description="Phase title, e.g. 'Foundation'")
    skills: List[RoadmapSkill] = Field(description="Skills belonging to this phase")

class SkillRoadmapResponse(BaseModel):
    id: Optional[str] = None
    target_role: str
    match_score: float
    phases: List[RoadmapPhase]

class RoadmapGenerateRequest(BaseModel):
    analysis_id: Union[str, int]
    target_role: Optional[str] = None

class RoadmapProgressRequest(BaseModel):
    roadmap_id: Union[str, int]
    skill_name: str
    new_status: str

# ---- Job Description Match ----

class JDMatchRequest(BaseModel):
    job_title: Optional[str] = None
    job_description: str
    analysis_id: Optional[Union[str, int]] = None

class JDMatchItem(BaseModel):
    skill: str = Field(description="The skill or keyword name")
    locations: List[str] = Field(description="Sections where the skill was found (e.g. 'Experience', 'Skills', 'Projects')", default_factory=list)
    evidence: List[str] = Field(description="Relevant bullet-point evidence quotes from the resume", default_factory=list)

class JDMatchResponse(BaseModel):
    match_score: float = Field(description="Overall match score from 0 to 100")
    summary: str = Field(description="Brief executive summary of the match analysis")
    strong_matches: List[JDMatchItem] = Field(description="Skills with strong evidence in Experience/Projects sections", default_factory=list)
    matches: List[JDMatchItem] = Field(description="Skills present/listed in the resume", default_factory=list)
    weak_matches: List[JDMatchItem] = Field(description="Skills found only in Summary/Education sections", default_factory=list)
    missing_keywords: List[str] = Field(description="Required skills from the JD not found in the resume", default_factory=list)
    recommendations: List[str] = Field(description="Actionable recommendations to improve match score", default_factory=list)
