from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from bson import ObjectId
from datetime import datetime

from src.models.product import Product  

def _normalize_mongo_document(doc):
    """Chuẩn hóa 1 document MongoDB để tiện convert sang DataFrame."""
    doc = dict(doc)
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])

    for key, value in list(doc.items()):
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()

    return doc


def get_all_products():
    """Lấy toàn bộ sản phẩm từ MongoDB và trả về dưới dạng pandas.DataFrame."""
    products_cursor = Product.get_all()
    products_list = [_normalize_mongo_document(p) for p in products_cursor]

    if not products_list:
        return pd.DataFrame()

    df = pd.DataFrame(products_list)

    # Bổ sung cột text kết hợp tên + mô tả để tính TF-IDF
    name_col = 'productName' if 'productName' in df.columns else 'product_name'
    desc_col = 'description' if 'description' in df.columns else None

    name_series = df[name_col].fillna('').astype(str)
    if desc_col and desc_col in df.columns:
        desc_series = df[desc_col].fillna('').astype(str)
        df['__text'] = name_series + ' ' + desc_series
    else:
        df['__text'] = name_series

    return df


def get_recommendations(product_name, products_df, top_n=5):
    """Tính toán top_n sản phẩm tương tự dựa trên TF-IDF nội dung mô tả."""
    if products_df is None or products_df.empty:
        return pd.DataFrame()

    products_df = products_df.reset_index(drop=True)

    if '__text' not in products_df.columns:
        raise ValueError("Cột '__text' chưa được chuẩn bị. Hãy gọi get_all_products() trước.")

    # Tạo vector TF-IDF từ mô tả sản phẩm
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(products_df['__text'])

    # Tính toán độ tương tự cosine giữa các sản phẩm
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Tìm index của sản phẩm cần recommend
    idx_list = products_df.index[products_df['productName'] == product_name].tolist()
    if not idx_list:
        return pd.DataFrame()

    idx = idx_list[0]

    # Lấy danh sách (index, similarity_score)
    sim_scores = list(enumerate(cosine_sim[idx]))
    # Sắp xếp theo độ tương tự giảm dần, loại bỏ chính nó
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = [s for s in sim_scores if s[0] != idx]

    # Lấy top_n
    sim_scores = sim_scores[:top_n]
    product_indices = [i for i, _ in sim_scores]

    columns_to_keep = [
        '_id',
        'productName',
        'unitPrice',
        'imageUrl',
        'description',
        'categoryId',
    ]
    existing_cols = [c for c in columns_to_keep if c in products_df.columns]

    return products_df.loc[product_indices, existing_cols]


def get_recommended_product_names(product_id, top_n=5):
    """Trả về DataFrame các sản phẩm được gợi ý cho 1 product_id nhất định."""
    products_df = get_all_products()
    if products_df.empty:
        return pd.DataFrame()

    if '_id' not in products_df.columns:
        return pd.DataFrame()

    str_id = str(product_id)
    product_details = products_df[products_df['_id'] == str_id]

    if product_details.empty:
        return pd.DataFrame()

    product_name = product_details['productName'].iloc[0]
    return get_recommendations(product_name, products_df, top_n=top_n)
