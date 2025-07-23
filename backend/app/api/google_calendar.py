from fastapi import APIRouter
from app.google.calendar_service import fetch_events, get_calendar_service

router = APIRouter()

@router.get("/google-calendar/events")
def get_google_calendar_events():
    """
    Returns a list of upcoming events from the target Google Calendar.
    """
    return {"events": fetch_events()}

@router.get("/google-calendar/list")
def get_google_calendar_list():
    """
    Returns a list of all accessible calendars to verify available calendar names.
    """
    service = get_calendar_service()
    try:
        calendar_list = service.calendarList().list().execute()
        return {"calendars": calendar_list.get("items", [])}
    except Exception as e:
        return {"error": str(e)}
