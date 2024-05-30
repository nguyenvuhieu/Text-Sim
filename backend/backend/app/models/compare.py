from pydantic import BaseModel, Field
from models import utility, corpus

class Text(BaseModel):
    type: utility.TextType = Field(...)
    raw: str = None
    document_id: str = None

class OneManyRequest(BaseModel):
    model: str = Field(...)
    one: Text = Field(...)
    many: list[Text] = Field(...)
    threshold: float = Field(...)

class Pair(BaseModel):
    first_sentence: int = Field(...)
    second_sentence: int = Field(...)
    score: float = Field(...)

class OneManyResponse(BaseModel):
   similarity: float = Field(...)
   similarities: list[float] = Field(...)
   pairs: list[list[Pair]] = Field(...)
   one: utility.Text = Field(...)
   many: list[utility.Text] = Field(...)

class CorpusRequest(BaseModel):
    model: str = Field(...)
    threshold: float = Field(...)
    text: Text = Field(...)
    corpus_ids: list[str] = Field(...)

class CorpusDocument(BaseModel):
    document: corpus.Document = Field(...)
    similarity: float = Field(...)
    pairs: list[Pair] = Field(...)

class CorpusResponse(BaseModel):
    text: utility.Text = Field(...)
    similarity: float = Field(...)
    corpus_documents: list[list[CorpusDocument]] = Field(...)
    
