const router = require('express').Router();
const Product = require('../models/Product');

// Lấy sản phẩm gợi ý từ MongoDB
router.get('/recommend/:productId', async (req, res) => {
  const productId = req.params.productId;

  // Lấy các ID sản phẩm gợi ý từ logic AI (hoặc từ cơ sở dữ liệu)
  const recommendedIds = getRecommendedProductIds(productId); // Giả sử đây là hàm của bạn

  // Truy vấn MongoDB để lấy thông tin chi tiết các sản phẩm gợi ý
  const recommendedProducts = await Product.find({
    '_id': { $in: recommendedIds }
  });

  // Trả về thông tin sản phẩm chi tiết
  const productsData = recommendedProducts.map(product => ({
    id: product._id.toString(),
    name: product.productName,
    price: product.unitPrice,
    image_url: product.imageUrl,
    description: product.description
  }));

  res.json({
    recommended_products: productsData
  });
});
module.exports = router;