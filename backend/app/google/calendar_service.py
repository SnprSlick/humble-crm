import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID")

def get_calendar_service():
    service_account_info = os.getenv("GOOGLE_SERVICE_ACCOUNT", "{}")
    if not service_account_info or service_account_info.strip() in ["", "{}"]:
        raise ValueError("❌ GOOGLE_SERVICE_ACCOUNT env var is missing or empty")

    try:
        credentials_info = json.loads(service_account_info)
        credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=SCOPES,
        )
        return build("calendar", "v3", credentials=credentials)
    except Exception as e:
        print("❌ Failed to load Google Calendar credentials:", e)
        raise

def create_event(title: str, description: str, start: datetime, end: datetime) -> str:
    service = get_calendar_service()

    if not CALENDAR_ID:
        raise ValueError("❌ GOOGLE_CALENDAR_ID not set")

    event_body = {
        "summary": title,
        "description": description,
        "start": {
            "dateTime": start.isoformat(),
            "timeZone": "America/Chicago",
        },
        "end": {
            "dateTime": end.isoformat(),
            "timeZone": "America/Chicago",
        },
    }

    try:
        event = service.events().insert(calendarId=CALENDAR_ID, body=event_body).execute()
        print(f"✅ Google Calendar event created: {event.get('htmlLink')}")
        return event.get("id")
    except Exception as e:
        print("❌ Failed to insert event into Google Calendar:", e)
        raise

def delete_event(event_id: str):
    service = get_calendar_service()

    print(f"🧪 Attempting to delete Google Calendar event: {event_id}")
    print(f"📆 CALENDAR_ID = {CALENDAR_ID}")

    try:
        service.events().delete(calendarId=CALENDAR_ID, eventId=event_id).execute()
        print(f"✅ Google Calendar event deleted: {event_id}")
    except Exception as e:
        print(f"❌ Google Calendar delete failed for {event_id}: {e}")

def fetch_events():
    service = get_calendar_service()
    now = datetime.utcnow().isoformat() + "Z"

    try:
        events_result = (
            service.events()
            .list(
                calendarId=CALENDAR_ID,
                timeMin=now,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        return events_result.get("items", [])
    except Exception as e:
        print("❌ Failed to fetch events from Google Calendar:", e)
        return []
