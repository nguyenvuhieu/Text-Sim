from fastapi import status, HTTPException
from config import Config
from pymongo import MongoClient
from models import model
from sentence_transformers import SentenceTransformer
import torch

instance = None
  
class DB():
  mongo = None
  def __new__(self):
    if not hasattr(self, 'instance'):
        self.instance = super(DB, self).__new__(self)
        mongodb_client = MongoClient(Config().MONGODB_URI)
        self.mongo = mongodb_client[Config().MONGODB_DB]
        print("Connected to the MongoDB database!")
    return self.instance
  
class Model():
  dict = dict()
  def __new__(self):
    if not hasattr(self, 'instance'):
        self.instance = super(Model, self).__new__(self)
    return self.instance
  
  def get_device(self):
    device = torch.device("cpu")
    if torch.cuda.is_available():
      device = torch.device('cuda')
    if torch.backends.mps.is_available():
      device = torch.device('mps')
    return device
  
  def list_model(self) -> dict:
    res = []
    for key in self.dict:
        res.append(model.Model(name=key))
    return {"models": res}

  def is_exist(self, name: str) -> bool:
    return name in self.dict
  
  def activate_model(self, name: str):
    try:
      model = SentenceTransformer(name).to(self.get_device())
    except:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model not found")
    self.dict[name] = model
    return self.list_model()
  
  def deactivate_model(self, name: str):
    del self.dict[name]
    return self.list_model()
  
  def get_model(self, name: str):
    if name not in self.dict:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model not found")
    return self.dict[name]