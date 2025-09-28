"use client"

import { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { motion } from "framer-motion"
import "swiper/css"
import "swiper/css/pagination"
import { Pagination } from "swiper/modules"
import { Link } from "react-router-dom"

// Import images
import img1 from "../assets/img.png"
import img2 from "../assets/img.png"
import img3 from "../assets/img.png"
import img4 from "../assets/img.png"
import api from "@/services/api.js";

const HomePage = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [productList, setProductList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const images = [img1, img2, img3, img4]

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Lấy sản phẩm
                const productsResponse = await api.get('/products', {
                    params: {
                        page: 0,
                        size: 100,
                        sort: 'productId,asc'
                    }
                });
                const visibleProducts = productsResponse.data.content.filter(product => {
                    const hiddenProducts = JSON.parse(localStorage.getItem('hiddenProducts') || '[]');
                    return !hiddenProducts.includes(product._id);
                });
                setProductList(visibleProducts);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể lấy dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Đang tải dữ liệu...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-lg">Lỗi: {error}</p>
            </div>
        )
    }

    return (
        <>
            {/* Hero Section */}
            <section
                className="hero-section text-white flex items-center"
                style={{
                    background: "#000000",
                    minHeight: "45vh",
                    padding: "50px 0",
                }}
            >
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Text Section */}
                        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                            <h1 className="font-bold text-4xl mb-3">Thiết kế không gian sống</h1>
                            <h2 className="font-bold text-2xl text-blue-500 mb-3">Hiện đại & Tinh tế</h2>
                            <p className="text-lg mt-3 py-3 opacity-90">
                                Khám phá bộ sưu tập nội thất cao cấp giúp nâng tầm không gian sống của bạn.
                            </p>
                            <motion.a
                                href="#products"
                                className="inline-flex items-center justify-center px-6 py-3 mt-3 font-medium bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Mua sắm ngay
                            </motion.a>
                        </div>

                        {/* Image Slider Section */}
                        <div className="md:w-1/2 flex justify-center">
                            <Swiper
                                modules={[Pagination]}
                                slidesPerView={1}
                                pagination={{
                                    clickable: true,
                                    renderBullet: (index, className) => {
                                        return `<span class="${className}" style="background: ${index === activeIndex ? "#FFF" : "rgba(255,255,255,0.5)"}; width: 10px; height: 10px; border-radius: 50%; margin: 5px; cursor: pointer;"></span>`
                                    },
                                }}
                                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                style={{ maxWidth: "450px", width: "100%" }}
                                className="rounded-lg overflow-hidden"
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
                                                src={img || "/placeholder.svg"}
                                                alt={`Nội thất ${index + 1}`}
                                                className="w-full h-auto rounded-lg shadow-lg"
                                                style={{
                                                    borderRadius: "12px",
                                                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                                                    border: "4px solid #333333",
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

            {/* Products Section */}
            <section id="products" className="py-10 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6 text-center">Sản phẩm nổi bật</h2>
                    {productList.length === 0 ? (
                        <p className="text-center text-gray-600">Không có sản phẩm nào để hiển thị.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productList.map((product) => (
                                <div key={product.productId} className="relative">
                                    <Link to={`/product/${product.productId}`} className="block">
                                        <div className={product.quantityInStock === 0 ? 'opacity-50' : ''}>
                                            <div className="bg-white rounded-lg shadow-md p-4">
                                                <img
                                                    src={product.imageUrl || "/placeholder.svg"}
                                                    alt={product.productName}
                                                    className="w-full h-48 object-contain rounded-md mb-4"
                                                />
                                                <h3 className="text-lg font-semibold mb-2">{product.productName}</h3>
                                                <p className="text-gray-600 text-sm mb-2">{product.description.slice(0, 60)}...</p>
                                                <div className="text-blue-600 font-bold text-lg">{product.originalPrice.toLocaleString("vi-VN")}₫</div>
                                            </div>
                                        </div>
                                        {product.quantityInStock === 0 && (
                                            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded z-10">
                                                Hết hàng
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default HomePage