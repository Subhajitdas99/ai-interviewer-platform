from fastapi import APIRouter, UploadFile, File
import shutil

from app.core.config import UPLOAD_DIR

from app.services.resume_parser import parse_resume

router = APIRouter(prefix="/api")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    file_path = (
        UPLOAD_DIR / file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_data = parse_resume(
        str(file_path)
    )

    return {
        "filename": file.filename,
        "parsed_data": parsed_data
    }
