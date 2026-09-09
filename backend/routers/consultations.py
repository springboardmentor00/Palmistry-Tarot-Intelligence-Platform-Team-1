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


# ==========================================
# BULLETPROOF ENDPOINT: SPECIALIST STATS 
# ==========================================
@router.get("/stats")
async def get_consultation_stats(user=Depends(get_current_user)):
    role = user.role.lower()

    if "palm" in role:
        specialist_type = "palm_reader"
    elif "tarot" in role:
        specialist_type = "tarot_reader"
    else:
        specialist_type = "spiritual_consultant"

    # 1. Pending count for the queue
    pending_count = await db.consultation.count(
        where={
            "specialistType": specialist_type,
            "status": "Pending"
        }
    )
    
    # 2. THE FIX: Explicitly INCLUDE the specialistConsultations array!
    user_data = await db.user.find_unique(
        where={"id": user.id},
        include={"specialistConsultations": True}  # <-- THIS WAS MISSING
    )
    
    # Now the array is actually loaded from the database
    consultations_list = getattr(user_data, "specialistConsultations", [])
    completed_count = len(consultations_list) if consultations_list else 0

    return {
        "pending": pending_count,
        "completedAllTime": completed_count
    }


# ==========================================
# FIXED ENDPOINT: REVIEW CONSULTATION
# ==========================================
@router.patch("/{consultation_id}/review")
async def review_consultation(
    consultation_id: str, data: ConsultationReview, user=Depends(get_current_user)
):
    role = user.role.lower()
    if role == "user":
        raise HTTPException(status_code=403, detail="Users cannot review tickets")

    # BUG 2 FIX: We removed json.dumps(). It now saves the beautifully formatted string directly!
    updated = await db.consultation.update(
        where={"id": consultation_id},
        data={
            "status": "Completed",
            "specialistId": user.id,
            "specialistNotes": data.specialistNotes, 
        },
    )

    # 👇 --- NEW: AUTOMATIC NOTIFICATION TRIGGER --- 👇
    await db.notification.create(
        data={
            "userId": updated.clientId,
            "title": "Consultation Ready",
            "message": f"Your specialist has completed your reading. Check your vault to view the insights.",
            "type": "normal",
            "isRead": False
        }
    )
    # 👆 -------------------------------------------- 👆
    
    return updated