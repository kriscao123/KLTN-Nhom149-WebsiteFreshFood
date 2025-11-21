from src.ai_models.user_cf import get_recommended_products_for_user


def get_user_recommended_products(user_id: str, top_n: int = 10):
    """Service gọi xuống tầng AI để lấy danh sách sản phẩm gợi ý cho user."""
    try:
        products = get_recommended_products_for_user(user_id, top_n=top_n)

        # Nếu không có sản phẩm gợi ý (user mới / chưa có tương tác)
        if not products:
            return []

        # 'products' đã là list[dict] với _id là string => trả thẳng cho API
        return products

    except Exception as e:
        raise Exception("Lỗi khi gợi ý sản phẩm theo user: " + str(e))
