from pydantic import BaseModel, Field
from enum import Enum
from bson.objectid import ObjectId

class LanguageType(Enum):
   EN = "EN"
   VN = "VN"
   ALL = "ALL"

class SimilarityType(Enum):
   COS_SIM = "COS_SIM"
   BOOL = "BOOL"
   LEVEL = "LEVEL"

class TextType(Enum):
   RAW = "RAW"
   CORPUS_DOCUMENT = "CORPUS_DOCUMENT"

class Text(BaseModel):
   sentences: list[str]
   paragraph_index: list[list[int]]
   
class File(BaseModel):
   file_name: str
   raw: str

class Files(BaseModel):
   files: list[File]

class ParseTextsRequest(BaseModel):
   texts: list[str]

class ParseTextsResponse(BaseModel):
   texts: list[Text]

class ModelConfig(BaseModel):
   name: str
   language: LanguageType
   similarity: SimilarityType

class DataType(Enum):
   SELECT = "SELECT"
   FLOAT = "FLOAT"

class SimilarityConfig(BaseModel):
   type: SimilarityType
   data_type: DataType
   select_options: list = None
   min: float = None
   max: float = None

class Config(BaseModel):
   languages: list[LanguageType]
   similarities: list[SimilarityConfig]
   models: list[ModelConfig]

class ObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")