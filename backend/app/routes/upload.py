import os
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile


router = APIRouter()


UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = str(UPLOAD_DIR / filename)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    url = f"/uploads/{filename}"
    return {"url": url}


