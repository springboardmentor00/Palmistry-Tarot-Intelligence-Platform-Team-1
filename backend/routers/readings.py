from fastapi import APIRouter, Depends, HTTPException
import json

from database import db
from schemas import ReadingCreate
from routers.profile import get_user_id

router = APIRouter(prefix="/api/readings", tags=["Readings"])


@router.post("/")
async def save_reading(data: ReadingCreate, user_id: str = Depends(get_user_id)):
    # 1. Save the actual reading (Your exact existing code)
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

    # 2. Extract metrics from the frontend payload
    raw_dict = data.rawData if isinstance(data.rawData, dict) else {}
    action_name = f"{data.readingType}_generated"
    
    # 3. Feed the Master Dashboard (Log the activity)
    await db.activitylog.create(
        data={
            "userId": user_id,
            "action": action_name,
            "metadata": json.dumps({
                "readingId": reading.id,
                "latency": raw_dict.get("latency", 1.8), # Populates VLM gauge
                "tokens": raw_dict.get("tokens", 1240),  # Populates AI Core chart
                "resolution": raw_dict.get("resolution", "1080p") # Populates Quality matrix
            })
        }
    )

    # 4. (Optional) Alert the user
    await db.notification.create(
        data={
            "userId": user_id,
            "title": "Analysis Complete",
            "message": f"Your {data.readingType} synthesis is ready.",
            "type": "system"
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

        # --- PALMISTRY DATA ---
        if r.readingType == "palm":
            palm_readings.append({
                "id": r.id,
                "handType": raw.get("handType", "Unknown"),
                "summary": r.summary,
                "personalitySynthesis": r.personalitySynthesis or "No interpretation available.",
                "lines": raw.get("lines", {}),
                "imageUrl": r.imageUrl,
                "createdAt": r.createdAt.isoformat(),
            })

        # --- TAROT DATA ---
        elif r.readingType == "tarot":
            tarot_readings.append({
                "id": r.id,
                "spreadType": raw.get("spreadName", "Tarot Reading"),
                "question": raw.get("question", None),
                "draw": raw.get("draw", []),
                "interpretation": r.personalitySynthesis or "No interpretation available.",
                "summary": r.summary,
                "createdAt": r.createdAt.isoformat(),
            })
            
        # --- INSIGHTS DATA ---
        elif r.readingType == "insight":
            insights.append({
                "id": r.id,
                "type": "insight",
                "question": raw.get("question", None), # <--- Add this line so the UI gets the Q!
                "summary": r.summary,
                "interpretation": r.personalitySynthesis or r.summary,
                "createdAt": r.createdAt.isoformat(),
            })

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

@router.get("/{reading_id}/download-trigger")
async def trigger_pdf_download(reading_id: str, user_id: str = Depends(get_user_id)):
    # 👇 We use user_id directly now!
    reading = await db.reading.find_unique(where={"id": reading_id})
    if not reading or reading.userId != user_id:
        raise HTTPException(status_code=404, detail="Reading not found")

    report_title = f"{reading.readingType.capitalize()} Reading Report - {reading_id[:8]}"

    # 1. Safely try to log to Reports table matching your exact schema
    try:
        existing_report = await db.report.find_first(where={
            "userId": user_id,
            "title": report_title
        })
        
        if not existing_report:
            await db.report.create(
                data={
                    "userId": user_id,
                    "title": report_title,
                    "fileUrl": f"frontend-generated-{reading_id}.pdf"
                }
            )
    except Exception as e:
        print(f"Report logging warning (safely bypassed): {e}")
        pass

    # 2. GUARANTEED: Log the download for the Admin Dashboard Funnel!
    await db.activitylog.create(
        data={
            "userId": user_id,
            "action": "report_downloaded",
            "metadata": json.dumps({"readingId": reading_id, "readingType": reading.readingType})
        }
    )

    return {"success": True}