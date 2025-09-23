from flask import Flask, request
import requests
from bs4 import BeautifulSoup
import re
import json

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from Felix!'

@app.route('/temu')
def temu():
    url = request.args.get("url")
    if not url:
        return "Missing ?url= parameter", 400

    # Fetch Temu page
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
    except requests.RequestException as e:
        return f"Error fetching Temu URL: {e}", 500

    # Parse HTML and look for window.__INITIAL_STATE__
    soup = BeautifulSoup(r.text, "html.parser")
    script = soup.find("script", string=re.compile("__INITIAL_STATE__"))
    img_url = None

    if script:
        match = re.search(r"window\.__INITIAL_STATE__\s*=\s*(\{.*\});", script.string)
        if match:
            try:
                data = json.loads(match.group(1))
                # Walk the JSON structure to find image
                product = data.get("productDetailV2", {}).get("productInfo", {})
                if "cover" in product:
                    img_url = product["cover"]
            except Exception as e:
                return f"Error parsing JSON: {e}", 500

    if not img_url:
        return "No image found", 404

    # Detect bots like Discord
    user_agent = request.headers.get("User-Agent", "").lower()
    is_bot = any(bot in user_agent for bot in ["discord", "twitterbot", "facebook", "telegram"])

    if is_bot:
        # Just Open Graph meta for Discord preview
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta property="og:title" content="Temu Product" />
            <meta property="og:description" content="Shared from Temu" />
            <meta property="og:image" content="{img_url}" />
            <meta property="og:type" content="website" />
        </head>
        <body></body>
        </html>
        """
        return html
    else:
        # Show image page for browsers
        html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Temu Image</title></head>
        <body style="text-align:center; margin-top:20px;">
            <h2>Temu Product</h2>
            <a href="{url}" target="_blank">
                <img src="{img_url}" alt="Temu Product" style="max-width:90%; height:auto;" />
            </a>
        </body>
        </html>
        """
        return html
