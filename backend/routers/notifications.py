from fastapi import APIRouter, Depends, HTTPException
from database import db
from routers.auth import get_current_user # adjust import path if needed

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/")
async def get_my_notifications(user=Depends(get_current_user)):
    # Fetch all notifications for the logged-in user, newest first
    notifications = await db.notification.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"},
        take=20 # Just grab the 20 most recent so we don't overload the UI
    )
    return notifications

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, user=Depends(get_current_user)):
    # Verify the notification actually belongs to this user
    existing = await db.notification.find_unique(where={"id": notification_id})
    if not existing or existing.userId != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")

    updated = await db.notification.update(
        where={"id": notification_id},
        data={"isRead": True}
    )
    return updated