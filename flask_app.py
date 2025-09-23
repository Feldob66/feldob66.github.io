from flask import Flask, request, redirect, render_template_string
import requests
from bs4 import BeautifulSoup

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

    # Extract image
    soup = BeautifulSoup(r.text, "html.parser")
    img = soup.find("img", {"src": True})
    img_url = img["src"] if img else None

    if not img_url:
        return "No image found", 404

    # Detect if request is from Discord/Twitter/etc.
    user_agent = request.headers.get("User-Agent", "").lower()
    is_bot = any(bot in user_agent for bot in ["discord", "twitterbot", "facebook", "telegram"])

    if is_bot:
        # Return OG tags for embed preview
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
        # Show image in browser
        html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Temu Image</title></head>
        <body style="text-align:center; margin-top:20px;">
            <h2>Temu Product</h2>
            <img src="{img_url}" alt="Temu Product" style="max-width:90%; height:auto;" />
        </body>
        </html>
        """
        return html
