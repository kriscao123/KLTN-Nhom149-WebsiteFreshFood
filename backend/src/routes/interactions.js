const router = require('express').Router();
const auth = require('../middleware/auth');
const Interaction = require('../models/Interaction');

router.post('/', auth, async (req, res) => {
  const doc = await Interaction.create({ ...req.body, user_id: req.user.id });
  res.json({ id: doc._id });
});

module.exports = router;
