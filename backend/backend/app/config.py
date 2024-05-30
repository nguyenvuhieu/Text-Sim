import os

class SingletonMeta(type):
  """Metaclass that ensures only one instance of a class exists"""
  _instances = {}

  def __call__(cls, *args, **kwargs):
    """
    This method is called whenever you try to create an instance of the class.
    It checks if an instance already exists, and if not, it creates one and returns it.
    """
    if cls not in cls._instances:
      instance = super().__call__(*args, **kwargs)
      cls._instances[cls] = instance
    return cls._instances[cls]
  
class Config(metaclass=SingletonMeta):
    PSQL_HOST = os.environ.get("PSQL_HOST")
    PSQL_DB = os.environ.get("PSQL_DB")
    PSQL_USER = os.environ.get("PSQL_USER")
    PSQL_PASS = os.environ.get("PSQL_PASS")

    MONGODB_URI = "mongodb+srv://nlp:ULLHZrYPBLzBWQpu@nlp.hzuorvm.mongodb.net/?retryWrites=true&w=majority&appName=nlp"
    MONGODB_DB = "nlp"
    
    COLLATION_CORPUS = "corpus"
    COLLATION_DOCUMENT = "corpus_document"
    COLLECTION_DATASET = 'dataset'
    COLLECTION_DATASET_RECORD = 'dataset_records'