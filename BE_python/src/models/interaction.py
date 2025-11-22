from pymongo import MongoClient
from bson import ObjectId
from config import Config

# Kết nối MongoDB dùng chung với các model khác
client = MongoClient(Config.MONGO_URI)
db = client.client['FoodSalesManagement']


class Interaction:
    """Model Python tương ứng collection 'interactions' của MongoDB"""

    @staticmethod
    def get_all():
        """Lấy toàn bộ interaction (dùng cho huấn luyện / gợi ý)."""
        return db.interactions.find()

    @staticmethod
    def get_by_user(user_id: str):
        """Lấy các interaction của 1 user nhất định (nếu cần debug)."""
        try:
            object_id = ObjectId(user_id)
        except Exception:
            return []
        return db.interactions.find({"user_id": object_id})
