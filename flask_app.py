from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/get_image")
def get_image():
    temu_url = request.args.get("url")
    if not temu_url:
        return jsonify({"error": "No Temu URL provided"}), 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        r = requests.get(temu_url, headers=headers, timeout=10)
        r.raise_for_status()

        soup = BeautifulSoup(r.text, "html.parser")
        meta = soup.find("meta", property="og:image")
        if meta and meta.get("content"):
            return jsonify({"image": meta["content"]})
        else:
            return jsonify({"error": "Could not find image"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return "Temu API is running! Use /get_image?url=<Temu-link> to get the product image."
