import os
from urllib.parse import urlparse
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection Configuration
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017/ai_resume_analyzer"
DEFAULT_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_resume_analyzer")

def get_database_name(url: str, default_name: str) -> str:
    try:
        parsed = urlparse(url)
        path = parsed.path.lstrip("/")
        if path:
            return path
    except Exception:
        pass
    return default_name

DB_NAME = get_database_name(DATABASE_URL, DEFAULT_DB_NAME)

# Initialize MongoClient
client = MongoClient(DATABASE_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
analyses_collection = db["resume_analyses"]
roadmaps_collection = db["skill_roadmaps"]

def init_db():
    """Initializes required MongoDB indexes"""
    try:
        # Users indexes
        users_collection.create_index([("email", ASCENDING)], unique=True, sparse=True)
        users_collection.create_index([("googleId", ASCENDING)], unique=True, sparse=True)
        
        # Resume analyses indexes
        analyses_collection.create_index([("user_id", ASCENDING)])
        analyses_collection.create_index([("created_at", DESCENDING)])
        
        # Skill roadmaps indexes
        roadmaps_collection.create_index([("user_id", ASCENDING)])
        roadmaps_collection.create_index([("analysis_id", ASCENDING)])
        
        print(f"[MongoDB] Connected successfully to database: {DB_NAME}")
    except Exception as e:
        print(f"[MongoDB] Note: Index initialization notice: {e}")

def get_db():
    """FastAPI dependency to yield database instance"""
    return db
