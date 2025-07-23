import os
import json
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "humbleperformance@gmail.com")  # Use email or full calendar ID

def get_calendar_service():
    service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT", "{}"))
    if not service_account_info:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT env var is missing or empty")

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
    )
    return build("calendar", "v3", credentials=credentials)

def fetch_events():
    service = get_calendar_service()
    now = datetime.datetime.utcnow().isoformat() + "Z"

    events_result = (
        service.events()
        .list(
            calendarId=CALENDAR_ID,
            timeMin=now,
            maxResults=50,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    return {"events": events_result.get("items", [])}

def list_calendars():
    service = get_calendar_service()
    calendar_list = service.calendarList().list().execute()
    return calendar_list.get("items", [])
