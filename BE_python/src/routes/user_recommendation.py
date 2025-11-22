from flask import Blueprint, jsonify
from src.services.user_recommendation import get_user_recommended_products

user_recommend_bp = Blueprint('user_recommend', __name__)

@user_recommend_bp.route('/<user_id>', methods=['GET'])
def recommend_for_user(user_id):
    """API: GET /user-recommendations/<user_id>"""
    try:
        products = get_user_recommended_products(user_id)
        if not products:
            return jsonify({"error": "No recommendations found for user."}), 404
        return jsonify({
            'user_id': user_id,
            'recommended_products': products
        }), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Log lỗi để kiểm tra
        return jsonify({'error': f"Error generating recommendations: {str(e)}"}), 500
