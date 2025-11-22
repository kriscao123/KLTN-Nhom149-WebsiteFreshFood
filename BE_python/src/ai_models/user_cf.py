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
    'purchase': 5.0
}


def _fetch_interactions():
    """Lấy toàn bộ interactions từ MongoDB và chuyển sang DataFrame"""
    cursor = db.interactions.find({
        'user_id': {'$ne': None},
        'product_id': {'$ne': None},
    })
    docs = list(cursor)
    if not docs:
        print("No interactions data found in MongoDB.")  # Log nếu không có dữ liệu
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
    """Từ DataFrame interactions => ma trận user-item"""
    if df is None or df.empty:
        print("User-Item matrix is empty.")  # Log nếu ma trận trống
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
    """Tính ma trận similarity giữa các sản phẩm"""
    if user_item is None or user_item.empty:
        print("User-Item matrix is empty, cannot compute similarity.")  # Log nếu ma trận trống
        return pd.DataFrame()

    item_matrix = user_item.T  # Chuyển từ user-item matrix sang item-user matrix
    sim = cosine_similarity(item_matrix)
    item_ids = list(item_matrix.index)
    sim_df = pd.DataFrame(sim, index=item_ids, columns=item_ids)

    return sim_df


def get_recommendations_for_user(user_id: str, top_n: int = 10):
    """Trả về danh sách product_id gợi ý cho user_id."""
    interactions_df = _fetch_interactions()
    if interactions_df.empty:
        print(f"No interactions data found for user {user_id}. Returning empty list.")
        return []

    user_item = _build_user_item_matrix(interactions_df)
    
    sim_df = _compute_item_similarity(user_item)
    
    user_vector = user_item.loc[user_id]
    interacted_items = set(user_vector[user_vector > 0].index.tolist())

    # Lấy danh sách các sản phẩm chưa được tương tác
    candidate_items = sim_df.columns.difference(interacted_items).tolist()
   
    
    scores = {}
    for item_id in candidate_items:
        similar_series = sim_df[item_id]

        for other_item_id, sim_score in similar_series.items():
        
            if sim_score <= 0:
                continue

            scores[item_id] = scores.get(item_id, 0.0) + (
                sim_score * float(user_vector[other_item_id])
            )
        
        
    sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_items = [item_id for item_id, _ in sorted_items[:top_n]]
    
    return top_items

def get_recommended_products_for_user(user_id: str, top_n: int = 10):
    """
    Trả về list dict thông tin sản phẩm gợi ý cho user:
    [{ 'imageUrl', 'productName', 'listPrice', 'unitPrice' }, ...]
    """
    product_ids = get_recommendations_for_user(user_id, top_n=top_n)
    if not product_ids:
        return []

    # Convert str -> ObjectId để query MongoDB
    object_ids = []
    for pid in product_ids:
        try:
            object_ids.append(ObjectId(pid))  # ObjectId để query trong MongoDB
        except Exception:
            continue

    if not object_ids:
        return []

    # Truy vấn sản phẩm từ MongoDB và chỉ lấy các trường cần thiết
    products_cursor = db.products.find(
        {'_id': {'$in': object_ids}},  # Tìm sản phẩm có _id trong danh sách
        {'imageUrl': 1, 'productName': 1, 'listPrice': 1, 'unitPrice': 1}  # Chỉ lấy các trường cần thiết
    )
    products = list(products_cursor)
    if not products:
        return []

    # Chuyển tất cả các ObjectId thành string
    products = convert_objectid_to_string(products)

    # Giữ đúng thứ tự gợi ý
    order_map = {pid: idx for idx, pid in enumerate(product_ids)}
    products.sort(key=lambda p: order_map.get(p['_id'], 1e9))

    return products


def convert_objectid_to_string(products):
    """Chuyển đổi ObjectId thành string trong danh sách sản phẩm"""
    for product in products:
        product['_id'] = str(product['_id'])  # Chuyển ObjectId thành string
        if 'categoryId' in product:
            product['categoryId'] = str(product['categoryId'])
        if 'supplierId' in product:
            product['supplierId'] = str(product['supplierId'])
    return products