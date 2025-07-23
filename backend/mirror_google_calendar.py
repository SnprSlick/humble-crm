import os
import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load service account credentials
service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON"))
credentials = service_account.Credentials.from_service_account_info(
    service_account_info,
    scopes=["https://www.googleapis.com/auth/calendar"]
)

calendar_service = build("calendar", "v3", credentials=credentials)

SOURCE_CALENDAR_ID = os.getenv("SOURCE_CALENDAR_ID")
TARGET_CALENDAR_ID = os.getenv("TARGET_CALENDAR_ID")

def already_exists(target_calendar_id, event_summary, start_time_iso):
    events = calendar_service.events().list(
        calendarId=target_calendar_id,
        timeMin=start_time_iso,
        timeMax=start_time_iso,
        q=event_summary,
        singleEvents=True
    ).execute()
    return len(events.get("items", [])) > 0

def mirror_events():
    now = datetime.utcnow().isoformat() + "Z"
    future = (datetime.utcnow() + timedelta(days=90)).isoformat() + "Z"

    source_events = calendar_service.events().list(
        calendarId=SOURCE_CALENDAR_ID,
        timeMin=now,
        timeMax=future,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    added = 0

    for event in source_events.get("items", []):
        if "start" not in event or "dateTime" not in event["start"]:
            continue  # skip all-day or malformed events

        start_time = event["start"]["dateTime"]
        end_time = event["end"]["dateTime"]
        summary = event.get("summary", "")

        if already_exists(TARGET_CALENDAR_ID, summary, start_time):
            continue

        new_event = {
            "summary": summary,
            "description": event.get("description", ""),
            "location": event.get("location", ""),
            "start": {"dateTime": start_time, "timeZone": "America/Chicago"},
            "end": {"dateTime": end_time, "timeZone": "America/Chicago"},
        }

        calendar_service.events().insert(calendarId=TARGET_CALENDAR_ID, body=new_event).execute()
        added += 1

    print(f"Mirroring complete. {added} events copied.")

if __name__ == "__main__":
    mirror_events()
