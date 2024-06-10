from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
from datetime import datetime
from functools import wraps
from models import utility
from config import Config
from internal import DB
from typing import Any
import uuid, bson


def with_timestamps(func):
  @wraps(func)
  def wrapper(self, *args, **kwargs):
    self.created_at = self.created_at or datetime.now()
    self.updated_at = datetime.now()
    return func(self, *args, **kwargs)
  return wrapper

class Dataset(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    language: utility.LanguageType
    similarity_type: utility.SimilarityType

class ListDataset(BaseModel):
    datasets: list[Dataset] = Field(...)

class DatasetRecord(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    dataset_id: str = Field(...)
    first_sentence: str = Field(...)
    second_sentence: str = Field(...)
    similarity: Any = None
    updated_at: Any = None
    created_at: Any = None

    @with_timestamps
    def insert_one(self):
        return DB().mongo[Config().COLLECTION_DATASET_RECORD].insert_one(jsonable_encoder(self))

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "first_sentence": "hello",
                "second_sentence": "hello",
                "similarity": 0.9
            }
        }

class UpdateDatasetRecord(BaseModel):
    first_sentence: str = Field(...)
    second_sentence: str = Field(...)
    similarity: float | int | bool
    class Config:
        json_schema_extra = {
            "example": {
                "first_sentence": "hello",
                "second_sentence": "hello",
                "score": 0.9
            }
        }