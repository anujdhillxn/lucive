from firebase_admin import messaging

def send_push_notification(token, title, body, data=None):
    """
    Sends a push notification to a device using FCM.

    Args:
        token (str): FCM device token of the recipient.
        title (str): Title of the notification.
        body (str): Body of the notification.
        data (dict, optional): Additional data payload.

    Returns:
        str: FCM message ID if successful.
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data if data else {},  # Optional data payload
        token=token,
    )
    try:
        response = messaging.send(message)
        return response
    except Exception as e:
        # Log the error for debugging
        print(f"Error sending notification: {e}")
        return None

