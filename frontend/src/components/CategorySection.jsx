"use client"
import { motion } from "framer-motion"

// Import icons (you can replace these with your actual icons)
import { CookingPotIcon as Kitchen, ShowerHeadIcon as Shower, Bed, Sofa } from "lucide-react"

const CategorySection = () => {
    const categories = [
        {
            id: 1,
            name: "Nhà bếp",
            icon: <Kitchen size={32} />,
            color: "#3B82F6",
            image: "/images/kitchen.jpg",
            description: "Thiết bị nhà bếp hiện đại, tiện nghi",
        },
        {
            id: 2,
            name: "Phòng tắm",
            icon: <Shower size={32} />,
            color: "#3B82F6",
            image: "/images/bathroom.jpg",
            description: "Không gian phòng tắm sang trọng",
        },
        {
            id: 3,
            name: "Phòng ngủ",
            icon: <Bed size={32} />,
            color: "#3B82F6",
            image: "/images/bedroom.jpg",
            description: "Nội thất phòng ngủ tinh tế",
        },
        {
            id: 4,
            name: "Phòng khách",
            icon: <Sofa size={32} />,
            color: "#3B82F6",
            image: "/images/living-room.jpg",
            description: "Thiết kế phòng khách hiện đại",
        },
    ]

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-2">Danh mục sản phẩm</h2>
                    <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Khám phá các sản phẩm chất lượng cao cho không gian sống của bạn</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div
                                className="h-40 bg-cover bg-center relative"
                                style={{
                                    backgroundImage: `url(${category.image || "/placeholder.svg?height=160&width=320"})`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            </div>

                            <div className="p-6 relative">
                                <div className="absolute -top-10 left-6 w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                                    <div className="text-blue-600">{category.icon}</div>
                                </div>

                                <h3 className="text-xl font-bold mt-6 mb-2">{category.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                                <a
                                    href={`/category/${category.id}`}
                                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                                >
                                    Xem thêm
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 ml-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategorySection
