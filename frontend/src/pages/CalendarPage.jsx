import os
import pickle
import datetime
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "credentials.json")
TOKEN_PATH = os.path.join(os.path.dirname(__file__), "token.pickle")
TARGET_CALENDAR_NAME = os.getenv("GOOGLE_CALENDAR_NAME", "HUMBLE PERFORMANCE")  # ← now uses env var

def get_calendar_service():
    creds = None

    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "rb") as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=8888)

        with open(TOKEN_PATH, "wb") as token:
            pickle.dump(creds, token)

    return build("calendar", "v3", credentials=creds)

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

    return { "events": events_result.get("items", []) }

def list_calendars():
    service = get_calendar_service()
    calendar_list = service.calendarList().list().execute()
    return calendar_list.get("items", [])
