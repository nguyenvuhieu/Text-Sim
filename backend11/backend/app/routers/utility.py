from typing import Annotated
from fastapi import responses, APIRouter, File, UploadFile, Body
from models import utility
from util import file_content, parse_text

router = APIRouter(prefix="/utility", tags=["utility"])

@router.get("/config", response_model=utility.Config)
async def get_config():
    languages = [member.value for member in utility.LanguageType]
    similarities = [
        utility.SimilarityConfig(type=utility.SimilarityType.COS_SIM, data_type=utility.DataType.FLOAT,  min=0.0, max=1.0),
        utility.SimilarityConfig(type=utility.SimilarityType.BOOL, data_type=utility.DataType.SELECT, select_options=[True, False]),
        utility.SimilarityConfig(type=utility.SimilarityType.LEVEL, data_type=utility.DataType.SELECT, select_options=[1,2,3,4,5]),
    ]
    models = [
        utility.ModelConfig(name="all-MiniLM-L6-v2", language=utility.LanguageType.EN.value, similarity=utility.SimilarityType.COS_SIM),
        utility.ModelConfig(name="paraphrase-multilingual-MiniLM-L12-v2", language=utility.LanguageType.ALL.value, similarity=utility.SimilarityType.COS_SIM)
    ]
    return utility.Config(languages=languages, similarities=similarities, models=models)

@router.post("/files")
async def create_upload_files(
    files: Annotated[
        list[UploadFile], File(description="Multiple files as UploadFile")
    ],
):
    return utility.Files(files=[file_content(file) for file in files])

@router.post('/parse-texts', response_model=utility.ParseTextsResponse)
async def parse_texts(req: utility.ParseTextsRequest = Body(...)):
    texts = []
    for text in req.texts:
        texts.append(parse_text(text))
    return utility.ParseTextsResponse(texts=texts)

@router.get("/test")
async def main():
    content = """
<body>
<form action="http://127.0.0.1:3000/utility/files" enctype="multipart/form-data" method="post">
<input name="files" type="file" multiple>
<input type="submit">
</form>
</body>
    """
    return responses.HTMLResponse(content=content)