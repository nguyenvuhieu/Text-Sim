from fastapi import APIRouter, Body, status, HTTPException
from models import model
from typing import List
from internal import Model

router = APIRouter(prefix="/model", tags=["model"])

@router.post("", response_model=dict)
async def load(item: model.Model = Body(...)):
    if Model().is_exist(item.name):
        return Model().list_model()
    return Model().activate_model(item.name)

@router.get("", response_model=dict)
async def list() -> List[model.Model]:
    return Model().list_model()

@router.delete("", response_model=dict)
async def deactivate(item: model.Model = Body(...)) -> List[model.Model]:
    return Model().deactivate_model(item.name)