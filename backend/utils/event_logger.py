import json
from datetime import datetime
from prisma import Prisma

async def record_user_event(
    prisma: Prisma,
    user_id: str,
    action: str,
    metadata: dict = None,
    notification_title: str = None,
    notification_message: str = None,
    notification_type: str = "system"
):
    """
    Writes to ActivityLog and Notification tables simultaneously.
    """
    # 1. Populate ActivityLog
    await prisma.activitylog.create(
        data={
            "userId": user_id,
            "action": action,
            "metadata": json.dumps(metadata or {}),
            "createdAt": datetime.utcnow()
        }
    )

    # 2. Populate Notification (if provided)
    if notification_title and notification_message:
        await prisma.notification.create(
            data={
                "userId": user_id,
                "title": notification_title,
                "message": notification_message,
                "type": notification_type,
                "isRead": False,
                "createdAt": datetime.utcnow()
            }
        )