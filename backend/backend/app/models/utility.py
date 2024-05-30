from pydantic import BaseModel, Field
from enum import Enum

class DataType(Enum):
   FLOAT = "FLOAT"
   INT = "INT"

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