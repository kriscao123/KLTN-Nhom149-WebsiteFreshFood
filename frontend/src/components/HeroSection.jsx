"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSection() {
  const images = [
    "/img/bia.png",
    "/img/bia2.jpeg",
    "/img/bia3.jpg",
    "/img/bia4.jpg",
  ];

  return (
    <section
      className="hero-section text-white flex items-center"
      style={{
        background:
          "linear-gradient(to bottom, rgba(40, 167, 69, 0.7), rgba(255, 255, 255, 0.7))",
        minHeight: "45vh",
        padding: "50px 0",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Section (bên trái) */}
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8 text-center md:text-left">
            <motion.h1
              className="font-bold text-4xl mb-3 text-green-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Thực phẩm tươi ngon
            </motion.h1>
            <motion.h2
              className="font-bold text-2xl text-green-800 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Chất lượng tuyệt vời - Giao nhanh chóng
            </motion.h2>
            <p className="text-lg mt-3 py-3 text-gray-800 opacity-90">
              Khám phá các món ăn tươi ngon từ nguồn thực phẩm sạch, luôn sẵn
              sàng để bạn thưởng thức ngay tại nhà.
            </p>

            <motion.a
              href="#products"
              className="inline-flex items-center justify-center px-6 py-3 mt-3 font-medium bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Khám phá ngay
            </motion.a>
          </div>

          {/* Image Slider Section (bên phải) */}
          <div className="md:w-1/2 flex justify-center">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={1}
              pagination={{
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className}" style="background: ${
                    index === 0 ? "#FFF" : "rgba(255,255,255,0.5)"
                  }; width: 10px; height: 10px; border-radius: 50%; margin: 5px; cursor: pointer;"></span>`,
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ maxWidth: "450px", width: "100%" }}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <motion.div
                    className="p-2"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={img}
                      alt={`Thực phẩm ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                        border: "4px solid #ffffff",
                      }}
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
