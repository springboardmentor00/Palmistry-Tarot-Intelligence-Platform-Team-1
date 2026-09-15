from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from database import db
from routers.profile import get_user_id

router = APIRouter(prefix="/api/insights", tags=["Insights"])

def get_time_elapsed_str(created_at: datetime) -> str:
    """Converts a timestamp into a human-readable elapsed time string."""
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    diff = now - created_at
    days = diff.days
    hours = diff.seconds // 3600

    if days == 0:
        return "Earlier today" if hours > 0 else "Just now"
    elif days == 1:
        return "Yesterday"
    elif days < 30:
        return f"{days} days ago"
    else:
        return f"{days // 30} months ago"

@router.get("/context")
async def get_user_context(user_id: str = Depends(get_user_id)):
    """
    Acts as the database memory. Returns the user's profile and history
    so the Next.js proxy can feed it to Gemini.
    """
    try:
        # 1. Fetch Profile Data
        profile = await db.profile.find_unique(where={"userId": user_id})
        zodiac = profile.zodiacSign if profile and profile.zodiacSign else "Not specified"
        goal = profile.primaryGoal if profile and profile.primaryGoal else "General life clarity"

        # 2. Fetch past 7 days of readings
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        readings_history = await db.reading.find_many(
            where={"userId": user_id, "isHidden": False, "createdAt": {"gte": seven_days_ago}},
            order={"createdAt": "asc"},
        )

        # Fallback: grab up to 3 most recent historical readings
        if not readings_history:
            readings_history = await db.reading.find_many(
                where={"userId": user_id, "isHidden": False},
                order={"createdAt": "desc"},
                take=3,
            )
            readings_history.reverse()

        # 3. Format into clean text
        context_items = []
        if readings_history:
            for r in readings_history:
                age = get_time_elapsed_str(r.createdAt)
                summary_content = r.personalitySynthesis or r.summary or "General reading completed."
                context_items.append(f"[{age} | {r.readingType.upper()} Reading]: {summary_content}")
            history_context = "\n".join(context_items)
        else:
            history_context = "No previous readings on record."

        return {
            "zodiac": zodiac,
            "goal": goal,
            "history": history_context
        }

    except Exception as e:
        print(f"Context Fetch Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user context from DB")