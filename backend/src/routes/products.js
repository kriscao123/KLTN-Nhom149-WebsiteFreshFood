const router = require('express').Router();
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

router.get('/', async (req, res) => {
  const { q, tag, allergen, cat } = req.query;
  const where = {};
  if (q) where.$text = { $search: q };
  if (tag) where.diet_tags = tag;
  if (allergen) where.allergens = allergen;
  if (cat) where.categories = cat;
  const items = await Product.find(where).limit(100).lean();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const prod = await Product.findById(req.params.id).lean();
  if (!prod) return res.status(404).json({ message: 'Not found' });
  const variants = await ProductVariant.find({ product_id: prod._id }).lean();
  res.json({ ...prod, variants });
});

module.exports = router;
