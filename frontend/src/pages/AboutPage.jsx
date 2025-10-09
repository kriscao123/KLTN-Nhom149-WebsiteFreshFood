import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="bg-primary text-white py-20"
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
            className="inline-block px-6 py-3 bg-secondary text-white rounded-md font-medium hover:bg-orange-600 transition-all"
          >
            Khám Phá Sản Phẩm
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-primary mb-4">Về Chúng Tôi</h2>
          <p className="text-lg text-gray-700">
            NH Food là một thương hiệu chuyên cung cấp thực phẩm tươi ngon, sạch và đảm bảo chất lượng từ
            các nhà cung cấp uy tín. Chúng tôi cam kết mang lại cho khách hàng những sản phẩm tốt nhất, với
            giá cả hợp lý và dịch vụ giao hàng nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <img
              src="/path/to/our-farm.jpg"
              alt="Nông trại sạch"
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            <h3 className="text-2xl font-semibold text-primary mb-4">Nguồn Gốc Thực Phẩm Sạch</h3>
            <p className="text-lg text-gray-700">
              Chúng tôi lựa chọn các sản phẩm từ những nông trại sạch, không sử dụng hóa chất độc hại. Mỗi sản phẩm của chúng tôi đều đảm bảo được kiểm tra chất lượng nghiêm ngặt trước khi đến tay khách hàng.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/path/to/our-team.jpg"
              alt="Nhân viên NH Food"
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            <h3 className="text-2xl font-semibold text-primary mb-4">Đội Ngũ Chuyên Nghiệp</h3>
            <p className="text-lg text-gray-700">
              Đội ngũ của NH Food luôn làm việc tận tâm để mang đến cho khách hàng những trải nghiệm tốt nhất. Chúng tôi luôn sẵn sàng giải đáp thắc mắc và hỗ trợ bạn trong mọi vấn đề liên quan đến sản phẩm.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold text-primary mb-6">Giá Trị Cốt Lõi Của NH Food</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-primary mb-3">Chất Lượng</h3>
              <p className="text-lg text-gray-700">
                Chúng tôi cam kết cung cấp sản phẩm tươi ngon, an toàn và đạt tiêu chuẩn chất lượng cao nhất.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-primary mb-3">Sự Minh Bạch</h3>
              <p className="text-lg text-gray-700">
                Mỗi sản phẩm của NH Food đều có nguồn gốc rõ ràng, và chúng tôi luôn sẵn sàng chia sẻ thông tin về quá trình sản xuất và kiểm tra chất lượng.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-primary mb-3">Dịch Vụ Tận Tâm</h3>
              <p className="text-lg text-gray-700">
                Đội ngũ của NH Food luôn đặt khách hàng lên hàng đầu, mang đến dịch vụ giao hàng nhanh chóng và sự hỗ trợ tận tình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-primary text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 NH Food. Tất cả quyền lợi được bảo lưu.</p>
          <div className="mt-4">
            <Link to="/contact" className="text-secondary hover:underline">Liên Hệ</Link> | 
            <Link to="/privacy" className="text-secondary hover:underline">Chính Sách Bảo Mật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
