from datetime import datetime
from bson import ObjectId
from typing import Any, Dict, Optional, Union

def to_object_id(val: Union[str, int, ObjectId, None]) -> Optional[ObjectId]:
    """Safely converts a string/ObjectId to a BSON ObjectId."""
    if val is None:
        return None
    if isinstance(val, ObjectId):
        return val
    try:
        if isinstance(val, str) and len(val) == 24:
            return ObjectId(val)
    except Exception:
        pass
    return None

def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Converts MongoDB document _id to id string and ensures serializable fields."""
    if not doc:
        return None
    doc_copy = dict(doc)
    if "_id" in doc_copy:
        doc_copy["id"] = str(doc_copy.pop("_id"))
    elif "id" in doc_copy and isinstance(doc_copy["id"], ObjectId):
        doc_copy["id"] = str(doc_copy["id"])
    return doc_copy
