from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

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

class AnalysisResult(BaseModel):
    overall_score: float
    ats_score: float
    skill_match: float
    issues_found: int

class ResumeAnalysisBase(BaseModel):
    filename: str
    overall_score: float
    ats_score: float
    skill_match: float
    issues_found: int

class ResumeAnalysisCreate(ResumeAnalysisBase):
    pass

class ResumeAnalysisResponse(ResumeAnalysisBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
