import os
import json
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
TARGET_CALENDAR_NAME = os.getenv("GOOGLE_CALENDAR_NAME", "HUMBLE PERFORMANCE")

def get_calendar_service():
    # Load service account credentials from env variable
    service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT", "{}"))
    if not service_account_info:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT env var is missing or empty")

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
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

    now = datetime.datetime.utcnow().isoformat() + "Z"
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

    return {"events": events_result.get("items", [])}

def list_calendars():
    service = get_calendar_service()
    calendar_list = service.calendarList().list().execute()
    return calendar_list.get("items", [])
