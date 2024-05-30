from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from internal import DB
from models import dataset, utility
from config import Config
import util

router = APIRouter(prefix="/dataset", tags=["dataset"])

# Dataset
@router.post("", response_model=dataset.Dataset)
async def create(item: dataset.Dataset = Body(...)):
    item = jsonable_encoder(item)
    new_item = DB().mongo[Config().COLLECTION_DATASET].insert_one(item)
    created_item = DB().mongo[Config().COLLECTION_DATASET].find_one(
        {"_id": new_item.inserted_id}
    )
    return created_item

@router.get("", response_model=dataset.ListDataset)
async def list(skip: int = 0, limit: int = 10) -> dict:
    l = DB().mongo[Config().COLLECTION_DATASET].find().skip(skip).limit(limit)
    return dataset.ListDataset(datasets=l)

@router.delete("/{id}", response_model=dict())
def delete_dataset(id: str):
    d_dataset = DB().mongo[Config().COLLECTION_DATASET].delete_many({"_id": id})
    d_record = DB().mongo[Config().COLLECTION_DATASET_RECORD].delete_many({"dataset_id": id})
    return {"deleted_datasets": d_dataset.deleted_count, "deleted_dataset_records": d_record.deleted_count}

# DatasetRecord
@router.post("/record", response_model=dataset.DatasetRecord)
async def create_record(item: dataset.DatasetRecord = Body(...)):
    dataset = DB().mongo[Config().COLLECTION_DATASET].find_one({"_id": item.dataset_id})
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Dataset with ID {item.dataset_id} not found")
    if not util.validate_data_type(utility.DataType(dataset['score_type']), item.score):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{type(item.score)} not match {dataset['score_type']}")
    item = jsonable_encoder(item)
    new_item = DB().mongo[Config().COLLECTION_DATASET_RECORD].insert_one(item)
    print(new_item)
    created_item = DB().mongo[Config().COLLECTION_DATASET_RECORD].find_one(
        {"_id": new_item.inserted_id}
    )
    return created_item

@router.get("/{id}/records")
async def list_document_in_corpus(id:str, skip: int = 0, limit: int = 10) -> dict:
    l = DB().mongo[Config().COLLECTION_DATASET_RECORD].find({'dataset_id': id}).skip(skip).limit(limit)
    return {'documents': l}

@router.get("/record/{id}", response_model=dataset.DatasetRecord)
def get(id: str): 
    if (item := DB().mongo[Config().COLLECTION_DATASET_RECORD].find_one({"_id": id})) is not None:
        return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID {id} not found")

@router.put("/record/{id}", response_model=dataset.DatasetRecord)
def update_record(id: str, item: dataset.UpdateDatasetRecord = Body(...)):
    record = DB().mongo[Config().COLLECTION_DATASET_RECORD].find_one({"_id": id})
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Dataset record with ID {id} not found")
    dataset = DB().mongo[Config().COLLECTION_DATASET].find_one({"_id": record['dataset_id']})
    if not util.validate_data_type(utility.DataType(dataset['score_type']), item.score):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{type(item.score)} not match {dataset['score_type']}")
    item = {k: v for k, v in item.model_dump().items() if v is not None}
    if len(item) >= 1:
        DB().mongo[Config().COLLECTION_DATASET_RECORD].update_one(
            {"_id": id}, {"$set": item}
        )
    if (
        existing_item := DB().mongo[Config().COLLECTION_DATASET_RECORD].find_one({"_id": id})
    ) is not None:
        return existing_item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID {id} not found")

@router.delete("/record/{id}", response_model=dict())
def delete_record(id: str):
    res = DB().mongo[Config().COLLECTION_DATASET_RECORD].delete_many({"_id": id})
    return {"deleted_records": res.deleted_count}
    

