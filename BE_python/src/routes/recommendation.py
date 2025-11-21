from flask import Blueprint, jsonify
from src.services.recommendation import get_recommended_products

recommend_bp = Blueprint('recommend', __name__)


@recommend_bp.route('/<product_id>', methods=['GET'])
def recommend_products(product_id):
    """API trả về danh sách sản phẩm được AI gợi ý cho product_id truyền vào."""
    try:
        recommended_products = get_recommended_products(product_id)
        return jsonify({
            "product_id": product_id,
            "recommended_products": recommended_products
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
