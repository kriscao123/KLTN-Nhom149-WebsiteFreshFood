import json
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# Kết nối tới MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['FoodSalesManagement']  # Thay 'your_database' bằng tên cơ sở dữ liệu của bạn
collection = db['products']  # Thay 'product' bằng tên collection của bạn

# Lấy tất cả document trong collection
products = collection.find()

def convert_objectid_and_datetime_to_str(document):
    for key, value in document.items():
        if isinstance(value, ObjectId):
            document[key] = str(value)  # Chuyển ObjectId thành chuỗi
        elif isinstance(value, datetime):
            document[key] = value.isoformat()  # Chuyển datetime thành chuỗi ISO 8601
    return document

# Chuyển dữ liệu MongoDB thành danh sách Python
products_list = [convert_objectid_and_datetime_to_str(product) for product in products]

# Lưu danh sách vào file JSON
with open('products.json', 'w', encoding='utf-8') as file:
    json.dump(products_list, file, ensure_ascii=False, indent=4)

print("Dữ liệu đã được xuất ra file products.json")
