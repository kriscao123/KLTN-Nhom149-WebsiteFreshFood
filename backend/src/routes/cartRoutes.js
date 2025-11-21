const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

const Interaction = require('../models/Interaction');
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

    const newInteraction = new Interaction({
      user_id:userId,
      product_id:productId,
      type: 'add_to_cart',
      value: quantity,  // Giá trị là số lượng thêm vào giỏ
    });

    await newInteraction.save();

    // Cập nhật tổng giá trị giỏ hàng
    cart.totalPrice += price * quantity;
    await cart.save(); // Lưu lại giỏ hàng đã cập nhật

    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ', cart:populated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', error });
  }
});


// Cập nhật sản phẩm trong giỏ hàng
router.put('/update', async (req, res) => {
  const { userId, productId, quantity, price } = req.body;

  try {
    const cart = await Cart.findOne({userId:userId,status:"active"});
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingProductIndex = cart.items.findIndex((item) => item.productId.toString() == productId);
    console.log("existingProductIndex:",existingProductIndex);
    if (existingProductIndex > -1) {
      const previousQuantity = cart.items[existingProductIndex].quantity;
      cart.items[existingProductIndex].quantity = quantity;

      // Cập nhật tổng giá trị giỏ hàng
      cart.totalPrice += (quantity - previousQuantity) * price;
    } else {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.status(200).json({ message: 'Sản phẩm đã được cập nhật', cart:populated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm trong giỏ hàng', error });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({userId,status:"active"});
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Tìm và xóa sản phẩm khỏi giỏ hàng
    const productIndex = cart.items.findIndex((item) => item.productId.toString() === String(productId));
    if (productIndex > -1) {
      const productPrice = cart.items[productIndex].price;
      const productQuantity = cart.items[productIndex].quantity;

      // Trừ tổng giá trị giỏ hàng
      cart.totalPrice -= productPrice * productQuantity;

      // Xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(productIndex, 1);
      await cart.save();

      const populated = await Cart.findById(cart._id).populate('items.productId');

      res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', cart:populated });
    } else {
      res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error });
  }
});


const Order = require('../models/Order'); 

router.post('/checkout', async (req, res) => {
  const { userId, deliveryAddress, paymentMethod, items, totalAmount } = req.body;

  if (!userId || !deliveryAddress || !paymentMethod || !items.length) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
  }

  try {
    // Lấy giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId: userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    // Tạo đơn hàng mới
    const orderData = {
      customerId: userId,
      orderItems: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      orderStatus: "PENDING",  // Đơn hàng sẽ ở trạng thái Pending khi tạo
      paymentMethod,
      paymentStatus: "Pending", // Thanh toán chờ xử lý
      shipAddress: deliveryAddress,
      totalAmount
    };

    const newOrder = await Order.create(orderData);

    for (const item of items) {
      const { productId, quantity } = item;

      const newInteraction = new Interaction({
        user_id: userId,           
        product_id: productId,     
        type: 'purchase',          
        value: quantity,           
      });

      await newInteraction.save();  
    }

    // Cập nhật trạng thái giỏ hàng thành "Completed"
    cart.status = 'Completed';
    await cart.save();

    res.status(201).json({ message: "Đặt hàng thành công", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xử lý thanh toán", error });
  }
});


module.exports = router;
