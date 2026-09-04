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
            "isHidden": False,
        }
    )
    return reading


@router.get("/")
async def get_history(user_id: str = Depends(get_user_id)):
    # Fetch ALL non-hidden readings for the user (No time limit)
    readings = await db.reading.find_many(
        where={"userId": user_id, "isHidden": False}, order={"createdAt": "desc"}
    )

    palm_readings = []
    tarot_readings = []
    insights = []

    for r in readings:
        # Safely parse the rawData JSONB field
        raw = r.rawData if isinstance(r.rawData, dict) else json.loads(r.rawData)

        # --- ALL INSIGHTS (No 7-Day Limit) ---
        insights.append(
            {
                "id": r.id,
                "type": r.readingType,
                "summary": r.summary,
                "date": r.createdAt.isoformat(),
            }
        )

        # --- PALMISTRY DATA ---
        if r.readingType == "palm":
            palm_readings.append(
                {
                    "id": r.id,
                    "handType": raw.get("handType", "Unknown"),
                    "summary": r.summary,
                    "personalitySynthesis": r.personalitySynthesis
                    or "No interpretation available.",
                    "lines": raw.get("lines", {}),
                    "imageUrl": r.imageUrl,  # <--- Image safely attached!
                    "createdAt": r.createdAt.isoformat(),
                }
            )

        # --- TAROT DATA ---
        elif r.readingType == "tarot":
            tarot_readings.append(
                {
                    "id": r.id,
                    "spreadType": raw.get("spreadName", "Tarot Reading"),
                    "question": raw.get("question", None),
                    "draw": raw.get("draw", []),
                    "interpretation": r.personalitySynthesis
                    or "No interpretation available.",
                    "summary": r.summary,
                    "createdAt": r.createdAt.isoformat(),
                }
            )

    return {
        "user": {"id": user_id, "name": "Seeker"},
        "palmReadings": palm_readings,
        "tarotReadings": tarot_readings,
        "insights": insights,
    }


@router.delete("/{reading_id}")
async def soft_delete_reading(reading_id: str, user_id: str = Depends(get_user_id)):
    reading = await db.reading.find_unique(where={"id": reading_id})
    if not reading or reading.userId != user_id:
        raise HTTPException(status_code=404, detail="Reading not found")

    # Soft delete: preserved for time-series / analytics, hidden from user UI
    await db.reading.update(where={"id": reading_id}, data={"isHidden": True})
    return {"success": True}
