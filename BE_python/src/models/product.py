from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client['FoodSalesManagement']

class Product:
    def __init__(self, product_id, product_name, category_id, unit_price, description, sales_count):
        self.product_id = product_id
        self.product_name = product_name
        self.category_id = category_id
        self.unit_price = unit_price
        self.description = description

    def save(self):
        db.products.insert_one(self.__dict__)

    @staticmethod
    def get_all():
        return db.products.find()

    @staticmethod
    def get_by_id(product_id):
        return db.products.find_one({'product_id': product_id})
