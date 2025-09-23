from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from Felix!'

@app.route('/scrape')
def scrape():
    # Example: fetch Temu page
    url = "https://share.temu.com/oVUcAzcleKB"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    # Parse HTML with pure-Python parser
    soup = BeautifulSoup(r.text, "html.parser")
    
    # Example: extract the <title> tag
    title = soup.title.string if soup.title else "No title found"

    return jsonify({"title": title})
