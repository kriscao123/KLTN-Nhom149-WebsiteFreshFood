// backend/src/routes/ordersRoutes.js
const router = require("express").Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");

// GET /api/orders?page=0&size=10
router.get("/", async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const size = Math.min(200, Math.max(1, parseInt(req.query.size, 10) || 10));

    const totalElements = await Order.countDocuments({});
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    let orders=[]

    if(page==0&&size==10){
      orders = await Order.find({})
        .sort({ orderDate: -1, _id: -1 })
        .lean();
    }
    else {
      orders = await Order.find({})
        .sort({ orderDate: -1, _id: -1 })
        .skip(page * size)
        .limit(size)
        .lean();
    }
    const content = orders.map((o) => ({
      ...o,
      _id: String(o._id),
      customerId: o.customerId ? String(o.customerId) : o.customerId,
      orderItems: Array.isArray(o.orderItems)
        ? o.orderItems.map((it) => ({
            ...it,
            _id: it._id ? String(it._id) : it._id,
            productId: it.productId ? String(it.productId) : it.productId,
          }))
        : [],
    }));

    return res.json({ content, totalPages, totalElements, page, size });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy danh sách orders" });
  }
});

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

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Order id không hợp lệ" });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    return res.json({
      ...order,
      _id: String(order._id),
      customerId: order.customerId ? String(order.customerId) : order.customerId,
      orderItems: Array.isArray(order.orderItems)
        ? order.orderItems.map((it) => ({
            ...it,
            _id: it._id ? String(it._id) : it._id,
            productId: it.productId ? String(it.productId) : it.productId,
          }))
        : [],
    });
  } catch (err) {
    console.error("GET /api/orders/:id error:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy chi tiết order" });
  }
});

module.exports = router;
