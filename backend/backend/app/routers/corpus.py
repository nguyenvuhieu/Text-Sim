from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from util import parse_text
from models import corpus
from config import Config
from internal import DB

router = APIRouter(prefix="/corpus", tags=["corpus"])

# Corpus
@router.post("", response_model=corpus.Corpus)
async def create_corpus(item: corpus.Corpus = Body(...)):
    item = jsonable_encoder(item)
    new_item = DB().mongo[Config().COLLATION_CORPUS].insert_one(item)
    created_item = DB().mongo[Config().COLLATION_CORPUS].find_one(
        {"_id": new_item.inserted_id}
    )
    return created_item

@router.get("")
async def list_corpus(skip: int = 0, limit: int = 10) -> dict:
    l = DB().mongo[Config().COLLATION_CORPUS].find().skip(skip).limit(limit)
    return {'corpus':l}

@router.delete("/{id}", response_model=dict())
def delete_corpus(id: str):
    d_corpus = DB().mongo[Config().COLLATION_CORPUS].delete_many({"_id": id})
    d_document = DB().mongo[Config().COLLATION_DOCUMENT].delete_many({"corpus_id": id})
    return {"deleted_corpus": d_corpus.deleted_count, "deleted_document": d_document.deleted_count}

# Documents
@router.post("/document", response_model=corpus.Document)
def create_document(item: corpus.CreateDocumentRequest = Body(...)):
    document = corpus.Document(corpus_id=item.corpus_id, title=item.title, text=parse_text(item.content))
    res = DB().mongo[Config().COLLATION_DOCUMENT].insert_one(jsonable_encoder(document))
    created_item = DB().mongo[Config().COLLATION_DOCUMENT].find_one(
        {"_id": res.inserted_id}
    )
    return created_item

@router.get("/{id}/documents")
async def list_document_in_corpus(id:str, skip: int = 0, limit: int = 10) -> dict:
    l = DB().mongo[Config().COLLATION_DOCUMENT].find({'corpus_id': id}).skip(skip).limit(limit)
    return {'documents': l}

@router.get("/document/{id}", response_model=corpus.Document)
def get_document(id: str):
    if (res := DB().mongo[Config().COLLATION_DOCUMENT].find_one({"_id": id})) is not None:
        return res
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID {id} not found")

@router.put("/document/{id}", response_model=corpus.Document)
def update_document(id: str, item: corpus.UpdateDocument = Body(...)):
    text = parse_text(item.content)
    DB().mongo[Config().COLLATION_DOCUMENT].update_one(
        {"_id": id}, {"$set": {"title": item.title, "text": {"sentences": text.sentences, "paragraph_index": text.paragraph_index}}}
    )
    if (existing_item := DB().mongo[Config().COLLATION_DOCUMENT].find_one({"_id": id})) is not None:
        print(existing_item)
        return existing_item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID {id} not found")

@router.delete("/document/{id}")
def delete_document(id: str):
    res = DB().mongo[Config().COLLATION_DOCUMENT].delete_many({"_id": id})
    return {"deleted_count": res.deleted_count}