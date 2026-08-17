from database import db, users_collection, analyses_collection, roadmaps_collection

def drop_collections():
    analyses_collection.drop()
    roadmaps_collection.drop()
    users_collection.drop()
    print("[MongoDB] Collections dropped successfully")

if __name__ == "__main__":
    drop_collections()
