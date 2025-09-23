from flask import Flask, request, render_template_string, jsonify
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
        return jsonify({"error": "Missing ?url="}), 400

    try:
        r = requests.get(url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        })
        r.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    soup = BeautifulSoup(r.text, "html.parser")

    # Use same logic that worked for you before:
    img = soup.find("img")
    image_url = img["src"] if img and img.get("src") else None

    if not image_url:
        return jsonify({"error": "No image found"}), 404

    # HTML response with image + OG tags (Discord preview)
    html_template = f"""
    <!doctype html>
    <html>
    <head>
        <meta property="og:title" content="Temu Product" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="{image_url}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="{image_url}" />
    </head>
    <body style="text-align:center; padding:20px;">
        <h1>Temu Product Image</h1>
        <img src="{image_url}" style="max-width:500px;">
    </body>
    </html>
    """
    return render_template_string(html_template)
