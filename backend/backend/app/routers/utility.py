from typing import Annotated
from fastapi import responses, APIRouter, File, UploadFile
from models import utility
from util import file_content

router = APIRouter(prefix="/utility", tags=["utility"])

@router.post("/files")
async def create_upload_files(
    files: Annotated[
        list[UploadFile], File(description="Multiple files as UploadFile")
    ],
):
    return utility.Files(files=[file_content(file) for file in files])

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