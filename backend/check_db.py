import json
from pprint import pprint
from database import db, users_collection, analyses_collection, roadmaps_collection, DB_NAME, DATABASE_URL

def inspect_database():
    print("=" * 60)
    print(f"MongoDB Status & Data Inspection")
    print(f"Database: {DB_NAME}")
    print(f"URL:      {DATABASE_URL}")
    print("=" * 60)
    
    try:
        # Check connection
        db.client.admin.command('ping')
        print(" Connected to MongoDB successfully!\n")
    except Exception as e:
        print(f" Connection Failed: {e}")
        print("\nPlease ensure MongoDB is running or verify DATABASE_URL in backend/.env")
        return

    # 1. Users Collection
    user_count = users_collection.count_documents({})
    print(f"📁 Collection [users]: {user_count} documents")
    for u in users_collection.find().limit(5):
        print(f"   - User ID: {u.get('_id')} | Email: {u.get('email')} | Name: {u.get('fullName')}")

    print("-" * 60)

    # 2. Resume Analyses Collection
    analysis_count = analyses_collection.count_documents({})
    print(f"📁 Collection [resume_analyses]: {analysis_count} documents")
    for a in analyses_collection.find().sort("created_at", -1).limit(5):
        print(f"   - Analysis ID:    {a.get('_id')}")
        print(f"     File:           {a.get('filename')}")
        print(f"     Overall Score:  {a.get('overall_score')}/100 (ATS: {a.get('ats_score')}, Skill: {a.get('skill_match')})")
        print(f"     User ID:        {a.get('user_id')}")
        print(f"     Created At:     {a.get('created_at')}")

    print("-" * 60)

    # 3. Skill Roadmaps Collection
    roadmap_count = roadmaps_collection.count_documents({})
    print(f"📁 Collection [skill_roadmaps]: {roadmap_count} documents")
    for r in roadmaps_collection.find().limit(5):
        print(f"   - Roadmap ID:     {r.get('_id')}")
        print(f"     Target Role:    {r.get('target_role')}")
        print(f"     Match Score:    {r.get('match_score')}%")
        print(f"     Analysis ID:    {r.get('analysis_id')}")

    print("=" * 60)

if __name__ == "__main__":
    inspect_database()
