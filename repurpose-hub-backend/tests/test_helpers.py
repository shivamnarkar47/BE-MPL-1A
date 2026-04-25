"""Tests for helpers module."""
import pytest
from bson import ObjectId
from pydantic import BaseModel
from helpers import to_model, doc_to_dict, docs_to_list


class UserModel(BaseModel):
    id: str
    email: str
    name: str = "test"


class TestToModel:
    def test_converts_objectid_to_id(self):
        doc = {"_id": ObjectId(), "email": "test@example.com", "name": "Test User"}
        user = to_model(doc, UserModel)
        assert user.id == str(doc["_id"])
        assert user.email == "test@example.com"

    def test_preserves_existing_id(self):
        doc = {"_id": ObjectId(), "id": "existing-id", "email": "test@example.com", "name": "Test"}
        user = to_model(doc, UserModel)
        assert user.id == "existing-id"

    def test_raises_on_none_document(self):
        with pytest.raises(ValueError, match="Document is None"):
            to_model(None, UserModel)

    def test_does_not_mutate_original(self):
        original = {"_id": ObjectId(), "email": "test@example.com", "name": "Test"}
        original_copy = original.copy()
        to_model(original, UserModel)
        assert original == original_copy


class TestDocToDict:
    def test_converts_objectid_to_id(self):
        doc = {"_id": ObjectId(), "email": "test@example.com"}
        result = doc_to_dict(doc)
        assert result["id"] == str(doc["_id"])
        assert "_id" not in result

    def test_returns_empty_dict_for_none(self):
        assert doc_to_dict(None) == {}


class TestDocsToList:
    def test_converts_list_of_docs(self):
        docs = [
            {"_id": ObjectId(), "email": "a@example.com", "name": "A"},
            {"_id": ObjectId(), "email": "b@example.com", "name": "B"},
        ]
        users = docs_to_list(docs, UserModel)
        assert len(users) == 2
        assert users[0].email == "a@example.com"
        assert users[1].email == "b@example.com"

    def test_filters_none_values(self):
        docs = [
            {"_id": ObjectId(), "email": "a@example.com", "name": "A"},
            None,
            {"_id": ObjectId(), "email": "b@example.com", "name": "B"},
        ]
        users = docs_to_list(docs, UserModel)
        assert len(users) == 2