from pydantic import BaseModel, Field
from models import utility
import uuid

class Corpus(BaseModel):
  id: str = Field(default_factory=uuid.uuid4, alias="_id")
  name: str = Field(...)

class Document(BaseModel):
  id: str = Field(default_factory=uuid.uuid4, alias="_id")
  corpus_id: str = Field(...)
  title: str = Field(...)
  text: utility.Text = Field(...)

class UpdateDocument(BaseModel):
  title: str = Field(...)
  content: str = Field(...)

class CreateDocumentRequest(BaseModel):
  corpus_id: str = Field(...)
  title: str = Field(...)
  content: str = Field(...)