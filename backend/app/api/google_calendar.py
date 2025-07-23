from fastapi import APIRouter
from app.google.calendar_service import fetch_events, list_calendars

router = APIRouter()

@router.get("/google-calendar/events")
def get_google_calendar_events():
    """
    Returns a list of upcoming events from the target Google Calendar.
    """
    return fetch_events()

@router.get("/google-calendar/list")
def get_google_calendar_list():
    """
    Returns a list of all accessible calendars to verify available calendar names.
    """
    return list_calendars()
