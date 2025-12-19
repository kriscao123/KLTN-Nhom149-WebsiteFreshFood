const router = require("express").Router();
const Order = require("../models/Order");

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`MISSING ENV: ${name}`);
  return v;
}

// POST /api/sepay/generate-qr
router.post("/generate-qr", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "THIẾU orderId" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "KHÔNG TÌM THẤY ORDER" });

    const SEPAY_QR_ACC = mustEnv("SEPAY_QR_ACC");   // số TK nhận
    const SEPAY_QR_BANK = mustEnv("SEPAY_QR_BANK"); // tên bank theo SePay
    const SEPAY_QR_PREFIX = process.env.SEPAY_QR_PREFIX || "SEVQR";

    const amount = Math.round(Number(order.totalAmount || 0));
    if (!amount || amount <= 0) return res.status(400).json({ message: "totalAmount KHÔNG HỢP LỆ" });

    const shortId = String(order._id).slice(-6).toUpperCase();
    const paymentCode = `${SEPAY_QR_PREFIX}${shortId}`;

    const des = encodeURIComponent(paymentCode);
    const qrUrl =
      `https://qr.sepay.vn/img?acc=${encodeURIComponent(SEPAY_QR_ACC)}` +
      `&bank=${encodeURIComponent(SEPAY_QR_BANK)}` +
      `&amount=${amount}&des=${des}`;

    // Lưu lại để webhook/polling đối soát
    order.sepay = order.sepay || {};
    order.sepay.paymentCode = paymentCode;
    order.sepay.qrUrl = qrUrl;
    await order.save();

    return res.json({ orderId: String(order._id), paymentCode, amount, qrUrl });
  } catch (err) {
    console.error("SEPAY generate-qr ERROR:", err);
    // Trả detail để bạn debug nhanh (dev). Khi lên production có thể bỏ detail.
    return res.status(500).json({ message: "LỖI SERVER KHI SINH QR", detail: err.message });
  }
});

router.get("/order-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select("orderStatus paymentStatus totalAmount")
      .lean();

    if (!order) return res.status(404).json({ message: "ORDER NOT FOUND" });

    return res.json({
      orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    return res.status(500).json({ message: "SERVER ERROR" ,detail: err.message });
  }
});
module.exports = router;
