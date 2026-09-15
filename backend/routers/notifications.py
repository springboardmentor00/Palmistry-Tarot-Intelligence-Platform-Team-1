from fastapi import APIRouter, Depends, HTTPException
import jwt
from database import db
from routers.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# We decode the token directly, exactly like you did in profile.py
async def get_token_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("")
async def get_my_notifications(user_id: str = Depends(get_token_user_id)):
    # Fetch all notifications for the logged-in user, newest first
    notifications = await db.notification.find_many(
        where={"userId": user_id},
        order={"createdAt": "desc"},
        take=20 
    )
    return notifications


@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, user_id: str = Depends(get_token_user_id)):
    # Verify the notification actually belongs to this user
    existing = await db.notification.find_unique(where={"id": notification_id})
    if not existing or existing.userId != user_id:
        raise HTTPException(status_code=404, detail="Notification not found")

    updated = await db.notification.update(
        where={"id": notification_id},
        data={"isRead": True}
    )
    return updated