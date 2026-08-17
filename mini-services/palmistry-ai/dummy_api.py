from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import os
import shutil
import uuid

from models.dummy_model import DummyPalmistryModel


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Palmistry AI API",
    description="Temporary dummy API for palmistry model integration",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# MODEL
# =========================================================

model = DummyPalmistryModel()


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Palmistry AI API is running",
        "model": "dummy"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model": "dummy-palmistry-model"
    }


# =========================================================
# PREDICT
# =========================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # -----------------------------------------------------
    # Generate unique filename
    # -----------------------------------------------------

    extension = os.path.splitext(
        file.filename
    )[1]

    filename = (
        str(uuid.uuid4())
        + extension
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )


    # -----------------------------------------------------
    # Save uploaded image
    # -----------------------------------------------------

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # -----------------------------------------------------
    # Dummy prediction
    # -----------------------------------------------------

    result = model.predict(
        file_path
    )


    # -----------------------------------------------------
    # Add filename
    # -----------------------------------------------------

    result["filename"] = file.filename


    # -----------------------------------------------------
    # Return response
    # -----------------------------------------------------

    return result
