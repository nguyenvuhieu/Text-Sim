from pydantic import BaseModel, Field
import uuid

class Model(BaseModel):
    name: str = Field(...)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "all-MiniLM-L6-v2",
            }
        }