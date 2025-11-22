from src.ai_models.user_cf import get_recommended_products_for_user


def get_user_recommended_products(user_id: str, top_n: int = 10):
    """Service gọi xuống tầng AI để lấy danh sách sản phẩm gợi ý cho user."""
    try:
        products = get_recommended_products_for_user(user_id, top_n=top_n)

        if not products:
            return []

        return products

    except Exception as e:
        raise Exception(f"Lỗi khi gợi ý sản phẩm theo user: {str(e)}")
