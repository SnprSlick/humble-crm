import os
import requests
from dotenv import load_dotenv

# Load your .env from the same path used in your CRM
env_path = "C:/Humble CRM/backend/app/key.env"
load_dotenv(env_path)

# Load env vars
token = os.getenv("BIGC_API_TOKEN")
client_id = os.getenv("BIGC_CLIENT_ID")
store_hash = os.getenv("BIGC_STORE_HASH")

# Confirm values loaded
print("[DEBUG] Loaded values:")
print("BIGC_API_TOKEN (starts with):", token[:8] if token else "❌ NOT LOADED")
print("BIGC_CLIENT_ID:", client_id if client_id else "❌ NOT LOADED")
print("BIGC_STORE_HASH:", store_hash if store_hash else "❌ NOT LOADED")

# Endpoint to test
url = f"https://api.bigcommerce.com/stores/{store_hash}/v3/orders/count"

# Construct headers
headers = {
    "X-Auth-Token": token,
    "X-Auth-Client": client_id,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "HumbleCRM/1.0"
}

# Send test request
print("\n[DEBUG] Sending GET request to:", url)
print("[DEBUG] Request headers:", headers)

try:
    response = requests.get(url, headers=headers)
    print("\n[DEBUG] Response Status Code:", response.status_code)
    print("[DEBUG] Response Body:", response.text)
except Exception as e:
    print("[ERROR] Request failed:", str(e))
