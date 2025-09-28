import { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProductModal from './components/ProductModal.jsx';
import CartSidebar from './components/CartSidebar.jsx';
import ChatPopup from './components/ChatPopup.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProductDetailPage from "@/pages/ProductDetailPage.jsx";
import Contact from './pages/Contact.jsx';
import HomePageAdmin from './pages/HomePageAdmin.jsx';
import UserLayout from './components/UserLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import CartPage from './pages/CartPage.jsx'
import { setupDarkMode } from './assets/js/utils.jsx';
import { getCart } from './assets/js/cartManager.jsx';
import { getUserFromLocalStorage } from "./assets/js/userData"
import CheckoutPage from "@/pages/CheckoutPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import ProductsAdminPage from "@/pages/ProductsAdminPage.jsx";
import OrderAdminPage from "@/pages/OrderAdminPage.jsx"
import CustomerAdminPage from "@/pages/CustomerAdminPage.jsx";
import Statistical from "@/pages/Statistical.jsx"
import Transport from "@/pages/Transport.jsx"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage.jsx";

export default function App() {
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setupDarkMode();

        const updateTotalItems = () => {
            const cart = getCart();
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            setTotalItems(itemCount);
        };

        updateTotalItems();
        window.addEventListener('storage', updateTotalItems);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => {
            window.removeEventListener('storage', updateTotalItems);
            clearTimeout(timer);
        };
    }, []);

    const handleProductClick = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // Component bảo vệ route cho Admin
    const AdminRoute = ({ element }) => {
        const user = getUserFromLocalStorage();
        if (!user || user.role !== "ADMIN") {
            return <Navigate to="/login" replace />;
        }
        return element;
    };

    // Component bảo vệ route cho User đã đăng nhập
    const ProtectedRoute = ({ element, allowedRoles }) => {
        const user = getUserFromLocalStorage();
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
        return element;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Router>
                <Routes>
                    {/* Các route công khai với UserLayout */}
                    <Route element={<UserLayout onCartClick={toggleCart} totalItems={totalItems} />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/products" element={<ProductsPage onProductClick={handleProductClick} />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cart" element={<ProtectedRoute element={<CartPage />} allowedRoles={["CUSTOMER"]} />} />
                        <Route path="/checkout" element={<ProtectedRoute element={<CheckoutPage />} allowedRoles={["CUSTOMER"]} />} />
                        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} allowedRoles={["CUSTOMER"]} />} />
                    </Route>

                    {/* Route cho admin với AdminLayout */}
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminRoute element={<HomePageAdmin />} />} />
                        <Route path="/admin/products" element={<AdminRoute element={<ProductsAdminPage />} />} />
                        <Route path="/admin/orders" element={<AdminRoute element={<OrderAdminPage />} />} />
                        <Route path="/admin/customers" element={<AdminRoute element={<CustomerAdminPage />} />} />
                        <Route path="/admin/analytics" element={<AdminRoute element={<Statistical />} />} />
                        <Route path="/admin/shipping" element={<AdminRoute element={<Transport />} />} />
                        <Route path="/admin/profile" element={<AdminRoute element={<ProfilePage />} />} />
                        <Route path="/admin/*" element={<AdminRoute element={<HomePageAdmin />} />} />
                    </Route>

                    {/* Chuyển hướng các đường dẫn không xác định về trang chủ */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <ProductModal
                    product={currentProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
                <CartSidebar
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />
                <ChatPopup />
            </Router>
        </div>
    );
}