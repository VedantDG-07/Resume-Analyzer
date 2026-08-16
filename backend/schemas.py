from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Any

class UserBase(BaseModel):
    email: str
    fullName: str
    profilePicture: Optional[str] = None
    provider: str = "Google"

class UserCreate(UserBase):
    googleId: str
    emailVerified: bool = False

class UserResponse(UserBase):
    id: int
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

class ResumeAnalysisCreate(ResumeAnalysisBase):
    pass

class ResumeAnalysisResponse(ResumeAnalysisBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
