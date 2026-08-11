from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    googleId = Column(String, unique=True, index=True)
    fullName = Column(String)
    email = Column(String, unique=True, index=True)
    profilePicture = Column(String)
    provider = Column(String, default="Google")
    emailVerified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("ResumeAnalysis", back_populates="owner")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    overall_score = Column(Float)
    ats_score = Column(Float)
    skill_match = Column(Float)
    issues_found = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="analyses")
