import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, HelpCircle, Layers, LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Truck, Users, X } from 'lucide-react';
import { getUserFromLocalStorage } from "../assets/js/userData";
import api from "../services/api";

const MenuAdmin = ({ user: propUser, isSidebarOpen, toggleSidebar, handleLogout }) => {
    const [activeLink, setActiveLink] = useState("/admin");
    const [user, setUser] = useState(propUser);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const getRole = (role) => {
        switch (role) {
            case "CUSTOMER": return "Khách hàng";
            case "ADMIN": return "Quản lý";
            default: return role || "Không xác định";
        }
    };

    useEffect(() => {
        console.log("MenuAdmin - propUser:", propUser); // Debug
        if (propUser) {
            setUser(propUser);
            return;
        }

        const storedUser = getUserFromLocalStorage();
        console.log("MenuAdmin - storedUser:", storedUser); // Debug
        if (!storedUser?.userId) {
            console.warn("No valid user found, redirecting to login");
            navigate("/login", { replace: true });
            return;
        }

        setUser(storedUser);
    }, [propUser, navigate]);

    const handleLogoutClick = (e) => {
        e.preventDefault(); // Prevent default Link behavior
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        handleLogout();
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:relative lg:translate-x-0`}
        >
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Layers className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold">HomeCraft Admin</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <nav className="space-y-1 px-2">
                        <p className="px-3 text-xs font-semibold uppercase text-gray-500">Tổng quan</p>
                        <Link
                            to="/admin"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin")}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/admin/analytics"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/analytics" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/analytics")}
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>Phân tích</span>
                        </Link>
                        <p className="mt-6 px-3 text-xs font-semibold uppercase text-gray-500">Quản lý</p>
                        <Link
                            to="/admin/products"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/products" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/products")}
                        >
                            <Package className="h-5 w-5" />
                            <span>Sản phẩm</span>
                        </Link>
                        <Link
                            to="/admin/orders"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/orders" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/orders")}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span>Đơn hàng</span>
                        </Link>
                        <Link
                            to="/admin/customers"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/customers" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/customers")}
                        >
                            <Users className="h-5 w-5" />
                            <span>Khách hàng</span>
                        </Link>
                        <Link
                            to="/admin/shipping"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/shipping" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/shipping")}
                        >
                            <Truck className="h-5 w-5" />
                            <span>Vận chuyển</span>
                        </Link>
                        <p className="mt-6 px-3 text-xs font-semibold uppercase text-gray-500">Cài đặt</p>
                        <Link
                            to="/admin/settings"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/settings" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/settings")}
                        >
                            <Settings className="h-5 w-5" />
                            <span>Thiết lập</span>
                        </Link>
                        <Link
                            to="/admin/help"
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                activeLink === "/admin/help" ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveLink("/admin/help")}
                        >
                            <HelpCircle className="h-5 w-5" />
                            <span>Trợ giúp</span>
                        </Link>
                    </nav>
                </div>

                {user ? (
                    <Link to="/admin/profile">
                        <div className="border-t p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="font-medium text-blue-600">{user.username?.charAt(0) || "U"}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user.username || "Người dùng"}</p>
                                    <p className="text-xs text-gray-500">{getRole(user.role)}</p>
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="border-t p-4">
                        <p className="text-sm text-gray-500">Đang tải thông tin người dùng...</p>
                    </div>
                )}

                {/* Logout Confirmation Modal */}
                {isLogoutModalOpen && (
                    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 w-screen">
                        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Xác nhận đăng xuất</h2>
                            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleLogoutConfirm}
                                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuAdmin;