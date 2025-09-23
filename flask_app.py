from flask import Flask, jsonify, request
import requests
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)

def get_temu_image_from_share(share_url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0"}
    # Follow the redirect to the final product URL
    resp = requests.get(share_url, headers=headers, allow_redirects=True, timeout=10)
    final_url = resp.url

    # Parse URL query parameters
    parsed = urlparse(final_url)
    params = parse_qs(parsed.query)

    # Temu usually includes the product image in 'thumb_url' or 'share_img'
    img_url = params.get("thumb_url") or params.get("share_img")
    if not img_url:
        raise ValueError("Could not find image in URL parameters")

    return img_url[0]  # parse_qs returns lists

@app.route('/')
def hello():
    return 'Hello from Felix!'

@app.route('/scrape')
def scrape():
    # Example: /scrape?url=https://share.temu.com/oVUcAzcleKB
    share_url = request.args.get("url")
    if not share_url:
        return jsonify({"error": "Missing ?url= parameter"}), 400

    try:
        image_url = get_temu_image_from_share(share_url)
        return jsonify({"image": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
