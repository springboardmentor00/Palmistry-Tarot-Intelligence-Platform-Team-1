from fastapi import APIRouter, Depends, HTTPException
import json
import hashlib
from datetime import date, datetime, timezone

# Import your actual DB and auth dependencies
from database import prisma  
from dependencies import get_current_user 

router = APIRouter()

ASTRO_CONSTANTS = {
    "Aries": {"rashi": "Aries (Mesh)", "element": "Fire", "rulingPlanet": "Mars"},
    "Taurus": {"rashi": "Taurus (Vrishabha)", "element": "Earth", "rulingPlanet": "Venus"},
    "Gemini": {"rashi": "Gemini (Mithun)", "element": "Air", "rulingPlanet": "Mercury"},
    "Cancer": {"rashi": "Cancer (Karka)", "element": "Water", "rulingPlanet": "Moon"},
    "Leo": {"rashi": "Leo (Simha)", "element": "Fire", "rulingPlanet": "Sun"},
    "Virgo": {"rashi": "Virgo (Kanya)", "element": "Earth", "rulingPlanet": "Mercury"},
    "Libra": {"rashi": "Libra (Tula)", "element": "Air", "rulingPlanet": "Venus"},
    "Scorpio": {"rashi": "Scorpio (Vrischika)", "element": "Water", "rulingPlanet": "Pluto / Mars"},
    "Sagittarius": {"rashi": "Sagittarius (Dhanu)", "element": "Fire", "rulingPlanet": "Jupiter"},
    "Capricorn": {"rashi": "Capricorn (Makara)", "element": "Earth", "rulingPlanet": "Saturn"},
    "Aquarius": {"rashi": "Aquarius (Kumbha)", "element": "Air", "rulingPlanet": "Uranus"},
    "Pisces": {"rashi": "Pisces (Meena)", "element": "Water", "rulingPlanet": "Neptune"},
    "Unknown": {"rashi": "Seeker (Universal)", "element": "Ether", "rulingPlanet": "Jupiter"}
}

def get_deterministic_scores(seed_string: str):
    """Generates real numbers that change daily, but stay identical on refresh"""
    hash_hex = hashlib.md5(seed_string.encode()).hexdigest()
    hash_int = int(hash_hex, 16)
    return {
        "intuition": 75 + (hash_int % 24),
        "clarity": 70 + ((hash_int // 10) % 26),
        "vitality": 80 + ((hash_int // 100) % 19),
        "luckyNumber": str((hash_int % 9) + 1)
    }

@router.get("/api/dashboard")
async def get_real_dashboard_data(current_user = Depends(get_current_user)):
    user_id = current_user.id
    role = current_user.role

    today_str = date.today().isoformat()
    daily_seed = f"{user_id}-{today_str}"
    daily_scores = get_deterministic_scores(daily_seed)

    # ==========================================
    # SEEKER: Fetch DB Facts & Pass to Node.js
    # ==========================================
    if role == "user":
        profile = await prisma.profile.find_first(where={"userId": user_id})
        sign = profile.zodiacSign.capitalize() if profile and profile.zodiacSign else "Unknown"
        primary_goal = profile.primaryGoal if profile and profile.primaryGoal else "Spiritual Growth"
        
        constants = ASTRO_CONSTANTS.get(sign, ASTRO_CONSTANTS["Unknown"])

        # Fetch latest reading context for AI personalization
        latest_reading = await prisma.reading.find_first(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
        reading_summary = latest_reading.summary if latest_reading else "No readings done yet. Seeking general daily guidance."

        return {
            "dashboard": {
                "role": role,
                "userId": user_id,
                "aiContext": {
                    "sign": sign,
                    "primaryGoal": primary_goal,
                    "readingSummary": reading_summary,
                },
                "astrology": {
                    "sign": sign,
                    "rashi": constants["rashi"],
                    "element": constants["element"],
                    "rulingPlanet": constants["rulingPlanet"],
                    "luckyNumber": daily_scores["luckyNumber"],
                    "energyScores": {
                        "intuition": daily_scores["intuition"],
                        "clarity": daily_scores["clarity"],
                        "vitality": daily_scores["vitality"]
                    }
                }
            }
        }

    # ==========================================
    # SPECIALIST: Real PostgreSQL Calculations
    # ==========================================
    elif role in ["palm_reader", "tarot_reader", "spiritual_consultant"]:
        completed_consults = await prisma.consultation.find_many(
            where={"specialistId": user_id, "status": "completed"},
            include={"client": True}, 
            order={"reviewedAt": "desc"}
        )
        
        total_rating = 0
        valid_reviews = 0
        total_time_diff_seconds = 0
        time_diff_count = 0
        recent_reviews = []
        now = datetime.now(timezone.utc)

        for consult in completed_consults:
            if consult.createdAt and consult.reviewedAt:
                diff = consult.reviewedAt - consult.createdAt
                total_time_diff_seconds += diff.total_seconds()
                time_diff_count += 1
                
            if consult.specialistNotes:
                try:
                    notes_data = json.loads(consult.specialistNotes) if isinstance(consult.specialistNotes, str) else consult.specialistNotes
                    if "rating" in notes_data and isinstance(notes_data["rating"], (int, float)):
                        rating = notes_data["rating"]
                        total_rating += rating
                        valid_reviews += 1
                        
                        if len(recent_reviews) < 3:
                            client_name = consult.client.name if consult.client and consult.client.name else "Anonymous Seeker"
                            comment = notes_data.get("review_comment", notes_data.get("summary", "Reading completed successfully."))
                            
                            if consult.reviewedAt:
                                days_ago = (now - consult.reviewedAt).days
                                time_str = f"{days_ago} days ago" if days_ago > 0 else "Today"
                            else:
                                time_str = "Recently"
                            
                            recent_reviews.append({
                                "name": client_name,
                                "rating": rating,
                                "comment": comment,
                                "time": time_str
                            })
                except (json.JSONDecodeError, TypeError):
                    pass 

        avg_rating = (total_rating / valid_reviews) if valid_reviews > 0 else 0.0
        satisfaction = (avg_rating / 5.0) * 100 if valid_reviews > 0 else 100.0
        
        avg_time_str = "N/A"
        if time_diff_count > 0:
            avg_seconds = total_time_diff_seconds / time_diff_count
            if avg_seconds < 3600:
                avg_time_str = f"{int(avg_seconds // 60)} min"
            else:
                avg_time_str = f"{int(avg_seconds // 3600)} hrs"

        return {
            "dashboard": {
                "role": role,
                "specialistStats": {
                    "satisfactionRate": round(satisfaction, 1),
                    "avgReviewTime": avg_time_str,
                    "completedReviews": len(completed_consults),
                    "practitionerEnergy": daily_scores["vitality"],
                    "rating": avg_rating,
                    "reviewCount": valid_reviews,
                    "recentReviews": recent_reviews
                }
            }
        }

    else:
        raise HTTPException(status_code=403, detail="Invalid role for dashboard access")