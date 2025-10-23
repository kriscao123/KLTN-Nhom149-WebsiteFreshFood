// Tạo giỏ hàng mới cho người dùng
const Cart = require('./models/Cart'); // Đảm bảo đường dẫn đúng tới tệp model của bạn

const createCart = async (userId) => {
  const newCart = new Cart({
    userId: userId, // Thay bằng ID người dùng thực tế
    items: [],
    totalPrice: 0,
  });

  await newCart.save();
  console.log('Giỏ hàng mới đã được tạo!');
};

// Giả sử tạo giỏ hàng cho người dùng có ID là "1234567890abcdef"
createCart('68d9050ed00dc9d19acd7e84');
