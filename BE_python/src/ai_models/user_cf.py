from pymongo import MongoClient
from bson import ObjectId
from config import Config
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Kết nối MongoDB
client = MongoClient(Config.MONGO_URI)
db = client.get_default_database()

# Trọng số cho từng loại tương tác
TYPE_WEIGHTS = {
    'view': 1.0,
    'add_to_cart': 3.0,
    'purchase': 5.0,
    'wishlist': 2.0,
    'rating': 4.0,
    'search': 1.0,
}


def _fetch_interactions():
    """
    Lấy toàn bộ interactions từ MongoDB và chuyển sang DataFrame:
    cột: user_id (str), product_id (str), type, value, score
    """
    cursor = db.interactions.find({
        'user_id': {'$ne': None},
        'product_id': {'$ne': None},
    })
    docs = list(cursor)
    if not docs:
        return pd.DataFrame()

    df = pd.DataFrame(docs)

    # Chuyển ObjectId -> string
    df['user_id'] = df['user_id'].astype(str)
    df['product_id'] = df['product_id'].astype(str)

    # Tính score cho từng interaction
    def _calc_score(row):
        base = TYPE_WEIGHTS.get(row.get('type'), 1.0)
        val = row.get('value')
        if val is None:
            return base
        try:
            return base * float(val)
        except (TypeError, ValueError):
            return base

    df['score'] = df.apply(_calc_score, axis=1)
    return df


def _build_user_item_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Từ DataFrame interactions => ma trận user-item:
    hàng = user_id, cột = product_id, giá trị = tổng score
    """
    if df is None or df.empty:
        return pd.DataFrame()

    user_item = df.pivot_table(
        index='user_id',
        columns='product_id',
        values='score',
        aggfunc='sum',
        fill_value=0.0,
    )
    return user_item


def _compute_item_similarity(user_item: pd.DataFrame) -> pd.DataFrame:
    """
    Tính ma trận similarity giữa các sản phẩm dựa trên vector người dùng
    """
    if user_item is None or user_item.empty:
        return pd.DataFrame()

    # item_matrix: mỗi dòng là 1 sản phẩm, feature là các user
    item_matrix = user_item.T  # shape: num_items x num_users

    sim = cosine_similarity(item_matrix)
    item_ids = list(item_matrix.index)
    sim_df = pd.DataFrame(sim, index=item_ids, columns=item_ids)
    return sim_df


def get_recommendations_for_user(user_id: str, top_n: int = 10):
    """
    Trả về danh sách product_id (string) gợi ý cho user_id.
    """
    interactions_df = _fetch_interactions()
    if interactions_df.empty:
        return []

    user_item = _build_user_item_matrix(interactions_df)
    if user_id not in user_item.index:
        # User chưa có tương tác => API có thể trả rỗng, FE tự fallback
        return []

    sim_df = _compute_item_similarity(user_item)
    if sim_df.empty:
        return []

    user_vector = user_item.loc[user_id]
    # Các sản phẩm user đã từng tương tác (score > 0)
    interacted_items = set(user_vector[user_vector > 0].index.tolist())
    if not interacted_items:
        return []

    scores = {}
    # Duyệt qua mỗi sản phẩm mà user đã tương tác
    for item_id in interacted_items:
        similar_series = sim_df[item_id]  # similarity tới mọi item khác

        for other_item_id, sim_score in similar_series.items():
            if other_item_id in interacted_items:
                continue  # không gợi ý lại sản phẩm user đã dùng
            if sim_score <= 0:
                continue

            # Điểm gợi ý = tổng(similarity * score tương tác của user)
            scores[other_item_id] = scores.get(other_item_id, 0.0) + (
                sim_score * float(user_vector[item_id])
            )

    if not scores:
        return []

    # Sắp xếp theo điểm giảm dần
    sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_items = [item_id for item_id, _ in sorted_items[:top_n]]
    return top_items


def get_recommended_products_for_user(user_id: str, top_n: int = 10):
    """
    Trả về list dict thông tin sản phẩm gợi ý cho user:
    [{ _id, productName, unitPrice, imageUrl, ... }, ...]
    """
    product_ids = get_recommendations_for_user(user_id, top_n=top_n)
    if not product_ids:
        return []

    # convert str -> ObjectId để query
    object_ids = []
    for pid in product_ids:
        try:
            object_ids.append(ObjectId(pid))
        except Exception:
            continue

    if not object_ids:
        return []

    products_cursor = db.products.find({'_id': {'$in': object_ids}})
    products = list(products_cursor)
    if not products:
        return []

    # Chuyển _id sang string
    for p in products:
        p['_id'] = str(p['_id'])

    # Giữ đúng thứ tự gợi ý
    order_map = {pid: idx for idx, pid in enumerate(product_ids)}
    products.sort(key=lambda p: order_map.get(p['_id'], 1e9))

    return products
