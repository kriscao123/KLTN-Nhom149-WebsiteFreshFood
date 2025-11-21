from src.ai_models.recommendation import get_recommended_product_names


def get_recommended_products(product_id):
    """Service gọi xuống tầng AI model và chuẩn hóa dữ liệu trả về cho API."""
    try:
        # Lấy DataFrame các sản phẩm gợi ý từ mô hình AI
        recommended_df = get_recommended_product_names(product_id)

        # Nếu không có sản phẩm gợi ý thì trả về list rỗng
        if recommended_df is None or recommended_df.empty:
            return []

        
        recommended_df = recommended_df.where(recommended_df.notnull(), None)

        # Convert DataFrame -> list[dict] để trả về cho frontend
        recommended_product_list = recommended_df.to_dict(orient="records")
        return recommended_product_list

    except Exception as e:
        # Ném lỗi lên cho tầng route xử lý
        raise Exception("Lỗi trong khi gợi ý sản phẩm: " + str(e))
