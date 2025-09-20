const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth');

const PY = process.env.PYTHON_API_URL || 'http://localhost:5001';

router.post('/fbt', auth, async (req, res) => {
  try {
    const { cart_items = [], topK = 6 } = req.body;
    const { data } = await axios.post(`${PY}/api/recommend/fbt`, { cart_items, topK }, { timeout: 10000 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'recommend fbt error', error: e.message });
  }
});

module.exports = router;
