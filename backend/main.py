from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth_router import router as auth_router

from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Palmistry & Tarot Intelligence API")

# --- UPDATED CORS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Wildcard to accept requests from anywhere in dev mode
    allow_credentials=False,  # Set to False because we use Bearer Tokens, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------

app.include_router(auth_router)


@app.get("/")
def health_check():
    return {"status": "online", "system": "Palmistry & Tarot Intelligence Platform"}
