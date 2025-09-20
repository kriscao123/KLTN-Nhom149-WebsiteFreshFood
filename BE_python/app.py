import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return {"status":"ok"}, 200

@app.post("/api/recommend/fbt")
def recommend_fbt():
    data = request.get_json(force=True) or {}
    cart_items = data.get("cart_items", [])
    topK = int(data.get("topK", 6))
    # TODO: đọc rules từ Mongo hoặc file parquet; hiện trả mock
    items = [{"productId":"mock-id-1","score":2.1},{"productId":"mock-id-2","score":1.7},{"productId":"mock-id-3","score":1.5}]
    return jsonify({ "model":"apriori-fpgrowth-mock", "items": items[:topK] })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
