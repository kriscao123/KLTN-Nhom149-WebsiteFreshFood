from flask import Flask
from flask_cors import CORS

from src.routes.recommendation import recommend_bp
from src.routes.user_recommendation import user_recommend_bp

app = Flask(__name__)

# Cho phép frontend (Vite) gọi sang AI API
CORS(app, origins=["http://localhost:5174", "http://localhost:5173"], supports_credentials=False)

# Đăng ký Blueprint cho các route
app.register_blueprint(recommend_bp, url_prefix='/recommendations')
app.register_blueprint(user_recommend_bp, url_prefix='/user-recommendations')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
