import { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartSidebar from './components/CartSidebar.jsx';
import CategorySection from './components/CategorySection.jsx';
import ChatPopup from './components/ChatPopup.jsx';
import { setupDarkMode } from './assets/js/utils.js';

export default function App() {
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Thiết lập Dark Mode khi ứng dụng được mount
    useEffect(() => {
        setupDarkMode();
    }, []);

    const handleProductClick = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        // Cuộn đến phần sản phẩm
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Header onCartClick={toggleCart} />

            <main>
                <HomePage />
                <CategorySection onCategorySelect={handleCategorySelect} />
                <ProductsPage
                    onProductClick={handleProductClick}
                    selectedCategory={selectedCategory}
                />
                <AboutPage />
            </main>

            <Footer />

            {/* Modal và Sidebar */}
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
        </div>
    );
}
