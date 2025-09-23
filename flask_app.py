from flask import Flask, request, Response
import requests
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)

def get_temu_image_from_share(share_url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(share_url, headers=headers, allow_redirects=True, timeout=10)
    final_url = resp.url

    parsed = urlparse(final_url)
    params = parse_qs(parsed.query)

    img_url = params.get("thumb_url") or params.get("share_img")
    if not img_url:
        raise ValueError("Could not find image in URL parameters")

    return img_url[0]

@app.route('/')
def hello():
    return '<h1>Hello from Felix!</h1><p>Use /scrape?url=YOUR_TEMU_SHARE_LINK</p>'

@app.route('/scrape')
def scrape():
    share_url = request.args.get("url")
    if not share_url:
        return Response("<p style='color:red'>Missing ?url= parameter</p>", mimetype="text/html")

    try:
        image_url = get_temu_image_from_share(share_url)
        html = f"""
        <html>
          <head><title>Temu Image</title></head>
          <body style="text-align:center; font-family:Arial">
            <h2>Temu Product Image</h2>
            <p><a href="{image_url}" target="_blank">{image_url}</a></p>
            <img src="{image_url}" alt="Temu Product" style="max-width:90%; height:auto; border:2px solid #ccc; border-radius:12px;"/>
          </body>
        </html>
        """
        return Response(html, mimetype="text/html")
    except Exception as e:
        return Response(f"<p style='color:red'>Error: {e}</p>", mimetype="text/html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
