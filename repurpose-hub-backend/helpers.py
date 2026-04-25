"""MongoDB document helpers - convert dict to model instances."""
from typing import Type, TypeVar, Any, Dict
from bson import ObjectId

T = TypeVar("T")


def to_model(doc: Dict[str, Any], model_class: Type[T]) -> T:
    """Convert MongoDB document to Pydantic model.
    
    Handles _id -> id conversion and removes MongoDB-specific fields.
    Only converts _id if 'id' is not already present.
    
    Args:
        doc: MongoDB document dict
        model_class: Pydantic model class
    
    Returns:
        Instance of model_class
    """
    if doc is None:
        raise ValueError("Document is None")
    
    # Make a copy to avoid mutating original
    data = dict(doc)
    
    # Convert ObjectId to string only if id not already set
    if "_id" in data:
        if "id" not in data:
            data["id"] = str(data["_id"])
        del data["_id"]
    
    return model_class(**data)


def doc_to_dict(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON-serializable dict.
    
    Converts ObjectId to string and removes MongoDB-specific fields.
    """
    if doc is None:
        return {}
    
    data = dict(doc)
    
    if "_id" in data:
        data["id"] = str(data["_id"])
        del data["_id"]
    
    return data


def docs_to_list(docs: list, model_class: Type[T]) -> list[T]:
    """Convert list of MongoDB documents to list of model instances."""
    return [to_model(doc, model_class) for doc in docs if doc]