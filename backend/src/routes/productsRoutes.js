const router = require('express').Router();
const Product = require('../models/Product');  // Kiểm tra lại import
const ProductVariant = require('../models/ProductVariant');

router.post('/', async (req, res) => {
  const { productName, categoryId, isActive, reorderLevel, supplierId, unitPrice, unitWeight, unitsInStock, unitsOnOrder, imageUrl } = req.body;
  const product = new Product({
    productName,
    categoryId,
    isActive,
    reorderLevel,
    supplierId,
    unitPrice,
    unitWeight,
    unitsInStock,
    unitsOnOrder,
    imageUrl
  });

  try {
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.put('/:id', async (req, res) => {
  const { productName, categoryId, isActive, reorderLevel, supplierId, unitPrice, unitWeight, unitsInStock, unitsOnOrder, imageUrl } = req.body;
  
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      productName,
      categoryId,
      isActive,
      reorderLevel,
      supplierId,
      unitPrice,
      unitWeight,
      unitsInStock,
      unitsOnOrder,
      imageUrl
    }, { new: true });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Lấy danh sách sản phẩm với các tham số tìm kiếm
router.get('/', async (req, res) => {
  const { q, tag, allergen, cat } = req.query;
  const where = {};

  if (q) where.$text = { $search: q };
  if (tag) where.diet_tags = tag;
  if (allergen) where.allergens = allergen;
  if (cat) where.categories = cat;

  try {
    // Tìm sản phẩm theo điều kiện tìm kiếm
    const products = await Product.find(where)
      .select('_id productName categoryId isActive reorderLevel supplierId unitPrice unitWeight unitsInStock unitsOnOrder imageUrl')  // Chỉ lấy các trường yêu cầu
      .limit(100)
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu sản phẩm', error: err.message });
  }
});

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id)
      .select('_id productName categoryId isActive reorderLevel supplierId unitPrice unitWeight unitsInStock unitsOnOrder imageUrl')  // Chỉ lấy các trường yêu cầu
      .lean();
    
    if (!prod) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    
    const similarProducts = await Product.find({ categoryId: prod.categoryId, unitsInStock: { $gt: 0 } })
      .limit(10)
      .lean();
    
    res.json({ ...prod, similarProducts });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu sản phẩm', error: err.message });
  }
});

module.exports = router;
