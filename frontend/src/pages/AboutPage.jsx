import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-green-50"> {}
      {/* Hero Section */}
      <section
        className="bg-green-600 text-white py-20"
        style={{
          backgroundImage: "url('/path/to/hero-image.jpg')", 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Chào mừng đến với NH Food
          </motion.h1>
          <motion.p
            className="text-xl mb-8 opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            Mang đến cho bạn thực phẩm tươi ngon, sạch và an toàn mỗi ngày
          </motion.p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-green-700 text-white rounded-md font-medium hover:bg-green-800 transition-all"
          >
            Khám Phá Sản Phẩm
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-green-700 mb-4">Về Chúng Tôi</h2>
          <p className="text-lg text-gray-700">
            NH Food là một thương hiệu chuyên cung cấp thực phẩm tươi ngon, sạch và đảm bảo chất lượng từ
            các nhà cung cấp uy tín. Chúng tôi cam kết mang lại cho khách hàng những sản phẩm tốt nhất, với
            giá cả hợp lý và dịch vụ giao hàng nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <img
              src="https://nh-food-bucket.s3.ap-southeast-1.amazonaws.com/img/bia2.jpeg" 
              alt="Nông trại sạch"
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Nguồn Gốc Thực Phẩm Sạch</h3>
            <p className="text-lg text-gray-700">
              Chúng tôi lựa chọn các sản phẩm từ những nông trại sạch, không sử dụng hóa chất độc hại. Mỗi sản
              phẩm của chúng tôi đều đảm bảo được kiểm tra chất lượng nghiêm ngặt trước khi đến tay khách hàng.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="https://nh-food-bucket.s3.ap-southeast-1.amazonaws.com/img/bia3.jpg"
              alt="Sản phẩm chất lượng"
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            <h3 className="text-2xl font-semibold text-green-900 mb-4">Sản Phẩm Chất Lượng</h3>
            <p className="text-lg text-gray-700">
              Mỗi sản phẩm của NH Food đều được chọn lọc kỹ lưỡng từ những nhà cung cấp uy tín, đảm bảo chất
              lượng và an toàn cho sức khỏe của bạn và gia đình.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
