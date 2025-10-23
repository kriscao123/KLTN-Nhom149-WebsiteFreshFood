const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart'); // Đảm bảo đường dẫn đúng tới model Cart

const router = express.Router();

// Tạo giỏ hàng mới cho người dùng
router.post('/create', async (req, res) => {
  const { userId } = req.body;

  try {
    const newCart = new Cart({
      userId: userId,
      items: [],
      totalPrice: 0,
    });
    await newCart.save();
    res.status(201).json({ message: 'Giỏ hàng đã được tạo!', cart: newCart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo giỏ hàng', error });
  }
});

// Lấy giỏ hàng của người dùng
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: userId, status: 'active' }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.put('/add', async (req, res) => {
  const { userId, productId, quantity, price } = req.body;

  try {
    // Kiểm tra xem giỏ hàng đã tồn tại chưa
    let cart = await Cart.findOne({userId:userId,status:"active"});

    if (!cart) {
      // Nếu giỏ hàng chưa tồn tại, tạo mới giỏ hàng
      cart = new Cart({
        userId: userId, // Gắn giỏ hàng với userId
        items: [],
        totalPrice: 0,
        status: 'active',
      });
      await cart.save(); // Lưu giỏ hàng mới vào cơ sở dữ liệu
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingProductIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (existingProductIndex > -1) {
      // Nếu sản phẩm đã có, chỉ cần cập nhật số lượng
      cart.items[existingProductIndex].quantity += quantity;
    } else {
      // Nếu sản phẩm chưa có, thêm mới sản phẩm vào giỏ hàng
      cart.items.push({ productId, quantity, price });
    }

    // Cập nhật tổng giá trị giỏ hàng
    cart.totalPrice += price * quantity;
    await cart.save(); // Lưu lại giỏ hàng đã cập nhật

    res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', error });
  }
});


// Cập nhật sản phẩm trong giỏ hàng
router.put('/update', async (req, res) => {
  const { cartId, productId, quantity, price } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingProductIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (existingProductIndex > -1) {
      const previousQuantity = cart.items[existingProductIndex].quantity;
      cart.items[existingProductIndex].quantity = quantity;

      // Cập nhật tổng giá trị giỏ hàng
      cart.totalPrice += (quantity - previousQuantity) * price;
    } else {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }

    await cart.save();
    res.status(200).json({ message: 'Sản phẩm đã được cập nhật', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm trong giỏ hàng', error });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove', async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Tìm và xóa sản phẩm khỏi giỏ hàng
    const productIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (productIndex > -1) {
      const productPrice = cart.items[productIndex].price;
      const productQuantity = cart.items[productIndex].quantity;

      // Trừ tổng giá trị giỏ hàng
      cart.totalPrice -= productPrice * productQuantity;

      // Xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(productIndex, 1);
      await cart.save();

      res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', cart });
    } else {
      res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error });
  }
});

// Xóa giỏ hàng hoặc hoàn tất đơn hàng
router.post('/checkout', async (req, res) => {
  const { cartId } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Cập nhật trạng thái giỏ hàng
    cart.status = 'checked_out';
    await cart.save();

    res.status(200).json({ message: 'Giỏ hàng đã được hoàn tất', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi hoàn tất giỏ hàng', error });
  }
});

module.exports = router;
