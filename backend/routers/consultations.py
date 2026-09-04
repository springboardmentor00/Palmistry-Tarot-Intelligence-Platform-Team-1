from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import jwt
import json
from database import db
from routers.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])


class ConsultationCreate(BaseModel):
    readingId: str
    specialistType: str  # 'palm_reader' or 'spiritual_consultant'
    clientQuestion: Optional[str] = None


class ConsultationReview(BaseModel):
    specialistNotes: str
    summary: Optional[str] = None
    rating: Optional[int] = None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/")
async def create_consultation(data: ConsultationCreate, user=Depends(get_current_user)):
    # 1. Check if the reading exists
    reading = await db.reading.find_unique(where={"id": data.readingId})
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    # 2. Create the ticket
    consultation = await db.consultation.create(
        data={
            "clientId": user.id,
            "readingId": data.readingId,
            "specialistType": data.specialistType,
            "clientQuestion": data.clientQuestion,
            "status": "Pending",
        }
    )
    return consultation


@router.get("/")
async def get_consultations(user=Depends(get_current_user)):
    role = user.role.lower()

    # User Inbox View
    if role == "user":
        tickets = await db.consultation.find_many(
            where={"clientId": user.id},
            include={"specialist": True, "reading": True},
            order={"createdAt": "desc"},
        )
        return tickets

    # Specialist Queue View
    if "palm" in role:
        specialist_type = "palm_reader"
    elif "tarot" in role:
        specialist_type = "tarot_reader"
    else:
        specialist_type = "spiritual_consultant"

    tickets = await db.consultation.find_many(
        where={
            "specialistType": specialist_type,
        },
        include={"client": {"include": {"profile": True}}, "reading": True},
        order={"createdAt": "desc"},
    )
    return tickets


@router.patch("/{consultation_id}/review")
async def review_consultation(
    consultation_id: str, data: ConsultationReview, user=Depends(get_current_user)
):
    role = user.role.lower()
    if role == "user":
        raise HTTPException(status_code=403, detail="Users cannot review tickets")

    # We store the combined notes, summary, and rating as a JSON string inside the specialistNotes field
    notes_dict = {
        "notes": data.specialistNotes,
        "summary": data.summary,
        "rating": data.rating,
    }

    updated = await db.consultation.update(
        where={"id": consultation_id},
        data={
            "status": "Completed",
            "specialistId": user.id,
            "specialistNotes": json.dumps(notes_dict),
        },
    )
    return updated
