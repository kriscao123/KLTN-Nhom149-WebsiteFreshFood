// backend/src/routes/sepayWebhookRoutes.js
const router = require("express").Router();
const Order = require("../models/Order");

function getApiKeyFromReq(req) {
  // SePay có thể gửi theo các header khác nhau
  const xApiKey = req.headers["x-api-key"];
  const apiKey = req.headers["api_key"];
  const apiKey2 = req.headers["api-key"];
  const auth = req.headers["authorization"];

  if (xApiKey) return String(xApiKey).trim();
  if (apiKey) return String(apiKey).trim();
  if (apiKey2) return String(apiKey2).trim();
  if (auth) return String(auth).replace(/^Bearer\s+/i, "").trim();

  return null;
}
function extractSepayCode(body) {
  const text = [body?.content, body?.description].filter(Boolean).join(" ");

  const m = text.match(/SEVQR([A-Z0-9]{4,})/i);
  if (m) return m[1].toUpperCase(); 

  
  const m2 = text.match(/NHFOOD-([A-Z0-9]+)/i);
  if (m2) return m2[1].toUpperCase();

  return "";
}

router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    const code = extractSepayCode(req.body);
    const amount = Number(data?.transferAmount || 0);

    // 1) Tìm order theo paymentCode
    const order = await Order.findOne({ "sepay.paymentCode": "SEVQR"+code });
    if (!order) {
      return res.status(200).json({ ok: true, ignored: "ORDER NOT FOUND", code });
    }

    
    if (amount && Number(order.totalAmount) !== amount) {
      return res.status(200).json({
        ok: true,
        ignored: "AMOUNT MISMATCH",
        orderTotal: order.totalAmount,
        received: amount
      });
    }

    // 3) Update đúng enum
    order.paymentStatus = "Paid";  
    order.orderStatus = "CONFIRMED";    
    order.sepay = order.sepay || {};
    order.sepay.paidAt = new Date();
    order.sepay.rawWebhook = data;

    await order.save();

    return res.status(200).json({ ok: true, updated: true, orderId: String(order._id) });
  } catch (err) {
  console.error("SEPAY WEBHOOK ERROR:", err);

  if (err?.errInfo?.details) {
    console.error("VALIDATION DETAILS:", JSON.stringify(err.errInfo.details, null, 2));
  } else if (err?.errorResponse?.errInfo?.details) {
    console.error("VALIDATION DETAILS:", JSON.stringify(err.errorResponse.errInfo.details, null, 2));
  }

  return res.status(500).json({ message: "SERVER ERROR", detail: err.message });
}

});

module.exports = router;
