from pydantic import BaseModel, Field
from models import utility
import uuid

class Dataset(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    score_type: utility.DataType

class ListDataset(BaseModel):
    datasets: list[Dataset] = Field(...)

class DatasetRecord(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    dataset_id: str = Field(...)
    first_sentence: str = Field(...)
    second_sentence: str = Field(...)
    score: float | int

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "first_sentence": "hello",
                "second_sentence": "hello",
                "score": 0.9
            }
        }

class UpdateDatasetRecord(BaseModel):
    first_sentence: str = Field(...)
    second_sentence: str = Field(...)
    score: float | int
    class Config:
        json_schema_extra = {
            "example": {
                "first_sentence": "hello",
                "second_sentence": "hello",
                "score": 0.9
            }
        }