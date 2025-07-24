import os
import requests
from dotenv import load_dotenv
import json

env_path = os.path.join(os.path.dirname(__file__), "key.env")
load_dotenv(env_path)

BIGC_API_TOKEN = os.getenv("BIGC_API_TOKEN")
BIGC_STORE_HASH = os.getenv("BIGC_STORE_HASH")

headers = {
    "X-Auth-Token": BIGC_API_TOKEN,
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# Pull a single order by ID (or first order on page 1)
url = f"https://api.bigcommerce.com/stores/{BIGC_STORE_HASH}/v2/orders"
params = {"limit": 1, "page": 1}

res = requests.get(url, headers=headers, params=params)
res.raise_for_status()
order = res.json()[0]

# Pretty print full order JSON
print(json.dumps(order, indent=2))
