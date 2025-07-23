import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow

# Load credentials.json
with open('credentials.json') as f:
    creds = json.load(f)['installed']

flow = InstalledAppFlow.from_client_config(
    {"installed": creds},
    scopes=["https://www.googleapis.com/auth/calendar"]
)

creds = flow.run_local_server(port=0)
print("Refresh token:", creds.refresh_token)
