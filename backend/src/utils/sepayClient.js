// sepayClient.js
const { SePayPgClient } = require("sepay-pg-node");

const sepayClient = new SePayPgClient({
  env: 'sandbox', // Chế độ sandbox cho thử nghiệm
  merchant_id: 'SP-TEST-CN979A47', // Thay bằng MERCHANT_ID bạn lấy từ SePay
  secret_key: 'spsk_test_TCzoj76xxfuQrtj9JvikY2K7iFinfb8A'  // Thay bằng SECRET_KEY bạn lấy từ SePay
});

module.exports = sepayClient;
