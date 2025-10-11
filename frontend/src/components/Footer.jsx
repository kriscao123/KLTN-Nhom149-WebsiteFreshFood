import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

function Footer() {
    return (
        <footer className="bg-green-600 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">NH Food
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Chuyên cung cấp các thực phẩm sạch chất lượng cao, giúp trải nghiệm ăn uống của bạn trở nên tươi mới và
                            khỏe mạnh.
                        </p>
                        <div className="flex space-x-4 text-gray-300">
                            <Link to="#" className=" hover:text-white">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link to="#" className=" hover:text-white">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link to="#" className=" hover:text-white">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link to="#" className=" hover:text-white">
                                <Youtube className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">Danh mục sản phẩm</h3>
                        <ul className="space-y-2">
                            {/* <li>
                                <Link to="/products?category=kitchen" className="text-gray-400 hover:text-white">
                                    Đồ dùng nhà bếp
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=electronics" className="text-gray-400 hover:text-white">
                                    Thiết bị điện tử
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=furniture" className="text-gray-400 hover:text-white">
                                    Nội thất
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=bathroom" className="text-gray-400 hover:text-white">
                                    Đồ dùng phòng tắm
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=decoration" className="text-gray-400 hover:text-white">
                                    Đồ trang trí
                                </Link>
                            </li> */}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">Thông tin</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                <Link to="/about" className="hover:text-white">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className=" hover:text-white">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className=" hover:text-white">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link to="/return-policy" className=" hover:text-white">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className=" hover:text-white">
                                    Hướng dẫn mua hàng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-2  mt-0.5" />
                                <span className="">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-2 " />
                                <span className="">+84827319452</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-2 " />
                                <span className="">nhanhoa.cao@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-white">
                    <p>&copy; {new Date().getFullYear()} NH Food. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
