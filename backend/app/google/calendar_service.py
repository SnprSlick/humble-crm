import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timezone

# Load service account credentials from environment
SERVICE_ACCOUNT_INFO = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON"))
TARGET_CALENDAR_NAME = os.getenv("TARGET_CALENDAR_NAME", "HUMBLE PERFORMANCE")

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_INFO,
        scopes=SCOPES
    )
    return build("calendar", "v3", credentials=credentials)

def find_calendar_id(service, target_name):
    calendar_list = service.calendarList().list().execute()
    for calendar in calendar_list.get("items", []):
        if calendar.get("summary") == target_name or calendar.get("summaryOverride") == target_name:
            return calendar.get("id")
    raise ValueError(f"Calendar with name '{target_name}' not found")

def fetch_events():
    service = get_calendar_service()
    calendar_id = find_calendar_id(service, TARGET_CALENDAR_NAME)

    now = datetime.now(timezone.utc).isoformat()
    events_result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=now,
            maxResults=50,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )

    return { "events": events_result.get("items", []) }

def list_calendars():
    service = get_calendar_service()
    calendar_list = service.calendarList().list().execute()
    return calendar_list.get("items", [])
