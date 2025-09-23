from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from Felix!'

@app.route('/scrape')
def scrape():
    # Get the Temu URL from query params, or use a default test link
    url = request.args.get("url", "https://share.temu.com/oVUcAzcleKB")
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    # Parse HTML
    soup = BeautifulSoup(r.text, "html.parser")
    
    # Try to extract the og:image meta tag first
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image_url = og_image["content"]
    else:
        # fallback: first <img> tag
        img_tag = soup.find("img")
        image_url = img_tag["src"] if img_tag else None

    if not image_url:
        return jsonify({"error": "No image found"}), 404

    return jsonify({"image": image_url})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
