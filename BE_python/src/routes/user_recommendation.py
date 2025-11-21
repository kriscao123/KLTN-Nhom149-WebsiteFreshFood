from flask import Blueprint, jsonify
from src.services.user_recommendation import get_user_recommended_products

user_recommend_bp = Blueprint('user_recommend', __name__)


@user_recommend_bp.route('/<user_id>', methods=['GET'])
def recommend_for_user(user_id):
    """API: GET /user-recommendations/<user_id>
    Trả về danh sách sản phẩm được gợi ý theo hành vi của user."""
    try:
        products = get_user_recommended_products(user_id)
        return jsonify({
            'user_id': user_id,
            'recommended_products': products
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
