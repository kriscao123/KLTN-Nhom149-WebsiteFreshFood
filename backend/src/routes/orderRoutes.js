const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order'); 

const router = express.Router();


// Lấy đơn hàng của người dùng
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const order = await Order.findOne({ customerId: userId});
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng', error });
  }
});


module.exports = router;
