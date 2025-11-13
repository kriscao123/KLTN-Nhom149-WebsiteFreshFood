const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order'); 

const router = express.Router();


// Lấy đơn hàng của người dùng
router.get('/user/:userId', async (req, res) => {
  try {
        const userId = req.params.userId;

        const order = await Order.find({ customerId: userId });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.json(order);  
    } catch (err) {
        console.error('Lỗi khi lấy đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
});


module.exports = router;
