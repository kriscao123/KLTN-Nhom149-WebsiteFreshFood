const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// 1. Tạo category mới
router.post('/', async (req, res) => {
  const { categoryName, parentCategoryId } = req.body;
  const category = new Category({ categoryName, parentCategoryId });

  try {
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Lấy tất cả category hoặc lọc theo parentCategoryId
router.get('/', async (req, res) => {
  const { parentCategoryId } = req.query; // Lọc theo parentCategoryId nếu có
  try {
    const filter = parentCategoryId ? { parentCategoryId } : {};
    const categories = await Category.find(filter);
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Lấy category theo ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Cập nhật category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Xóa category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
