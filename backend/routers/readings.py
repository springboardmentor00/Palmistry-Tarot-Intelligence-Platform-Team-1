from fastapi import APIRouter, Depends, HTTPException
import json

from database import db
from schemas import ReadingCreate
from routers.profile import get_user_id

router = APIRouter(prefix="/api/readings", tags=["Readings"])

@router.post("/")
async def save_reading(data: ReadingCreate, user_id: str = Depends(get_user_id)):
    reading = await db.reading.create(
        data={
            "userId": user_id,
            "readingType": data.readingType,
            "summary": data.summary,
            "personalitySynthesis": data.personalitySynthesis,
            "rawData": json.dumps(data.rawData),
            "imageUrl": getattr(data, "imageUrl", None),
            "isHidden": False
        }
    )
    return reading

@router.get("/")
async def get_history(user_id: str = Depends(get_user_id)):
    readings = await db.reading.find_many(
        where={
            "userId": user_id,
            "isHidden": False
        },
        order={"createdAt": "desc"}
    )
    return readings

@router.delete("/{reading_id}")
async def soft_delete_reading(reading_id: str, user_id: str = Depends(get_user_id)):
    reading = await db.reading.find_unique(where={"id": reading_id})
    if not reading or reading.userId != user_id:
        raise HTTPException(status_code=404, detail="Reading not found")
    
    # Soft delete: preserved for time-series / analytics, hidden from user UI
    await db.reading.update(
        where={"id": reading_id},
        data={"isHidden": True}
    )
    return {"success": True}