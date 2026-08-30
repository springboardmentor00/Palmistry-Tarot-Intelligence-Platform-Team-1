from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from google import genai

from database import db
from routers.profile import get_user_id

# 1. Force Python to read the .env file!
load_dotenv()

router = APIRouter(prefix="/api/insights", tags=["Insights"])

# 2. Initialize the Modern Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in your .env file!")

client = genai.Client(api_key=GEMINI_API_KEY)


class ChatRequest(BaseModel):
    question: str


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


@router.post("/")
async def ask_spiritual_guide(
    request: ChatRequest, user_id: str = Depends(get_user_id)
):
    """
    Conversational chatbot endpoint. Takes the user's specific question,
    uses the past 7 days of Palm & Tarot reading outputs (summaries/syntheses)
    as silent background context, and answers strictly that question.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        # Fetch User Profile
        profile = await db.profile.find_unique(where={"userId": user_id})
        zodiac = (
            profile.zodiacSign if profile and profile.zodiacSign else "Not specified"
        )
        goal = (
            profile.primaryGoal
            if profile and profile.primaryGoal
            else "General life clarity"
        )

        # Fetch past 7 days of readings
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        readings_history = await db.reading.find_many(
            where={
                "userId": user_id,
                "isHidden": False,
                "createdAt": {"gte": seven_days_ago},
            },
            order={"createdAt": "asc"},
        )

        # Fallback: If no activity in past 7 days, grab up to 3 most recent historical readings
        if not readings_history:
            readings_history = await db.reading.find_many(
                where={"userId": user_id, "isHidden": False},
                order={"createdAt": "desc"},
                take=3,
            )
            readings_history.reverse()  # Maintain chronological order

        # Extract ONLY clean outputs/summaries
        context_items = []
        if readings_history:
            for r in readings_history:
                age = get_time_elapsed_str(r.createdAt)
                summary_content = (
                    r.personalitySynthesis or r.summary or "General reading completed."
                )
                context_items.append(
                    f"[{age} | {r.readingType.upper()} Reading Result]: {summary_content}"
                )
            history_context = "\n".join(context_items)
        else:
            history_context = "No previous readings on record."

        # Strict Chatbot Prompt
        prompt = f"""
You are the Mystica Spiritual Advisor chatbot. 
The seeker is asking you a specific question in a live chat session.

SEEKER BACKGROUND & RECENT READING OUTPUTS:
- Zodiac Sign: {zodiac}
- Core Life Goal: {goal}
- Past Reading Results:
{history_context}

USER'S CURRENT CHAT QUESTION:
"{request.question}"

CORE INSTRUCTIONS:
1. Answer ONLY the specific question asked by the user above.
2. Do NOT provide a generic life report, unsolicited horoscope, or broad overview.
3. Use their past reading results and profile as internal background memory to make your response personally relevant, but do not recite the readings back to them word-for-word.
4. Keep the response natural, conversational, intuitive, and concise (1-2 direct paragraphs).
"""

        # Generate Response via the new Gemini SDK syntax
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        return {"status": "success", "answer": response.text}

    except Exception as e:
        print(f"Chatbot Insights Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to get response from Spiritual Guide"
        )
