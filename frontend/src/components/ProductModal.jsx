import React, { useState, useEffect } from 'react';
import { formatPrice, generateRatingStars, getProductIcon } from '../assets/js/utils.jsx';
import { addToCart } from '../assets/js/cartManager.jsx';

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (product) {
            setQuantity(1);
            setAddedToCart(false);
        }
    }, [product]);

    if (!product || !isOpen) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAddedToCart(true);
        onAddToCart(); // Gọi hàm cập nhật số lượng từ component cha
        setTimeout(() => {
            setAddedToCart(false);
        }, 2000);
    };

    const handleBuyNow = () => {
        import('../assets/js/cartManager.jsx').then(({ clearCart, addToCart, toggleCartSidebar }) => {
            clearCart();
            addToCart(product, quantity);
            onClose();
            toggleCartSidebar();
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1050,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            onClick={handleOverlayClick}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-white rounded-lg shadow-lg" style={{ width: '500px', height: '500px' }}>
                    <div className="modal-header">
                        <h3 className="modal-title text-xl font-semibold">{product.name}</h3>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 h-full flex flex-col">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-100 rounded flex items-center justify-center h-48">
                                <i className={`${getProductIcon(product)} text-6xl text-gray-500`}></i>
                            </div>
                            <div>
                                <div className="flex items-center mb-3">
                                    <div
                                        className="text-yellow-500 mr-2"
                                        dangerouslySetInnerHTML={{ __html: generateRatingStars(product.rating) }}
                                    ></div>
                                    <span className="text-gray-500 text-sm">({product.reviewCount} đánh giá)</span>
                                </div>
                                <h4 className="text-blue-600 font-bold text-2xl mb-3">{formatPrice(product.price)}</h4>
                                <p className="text-gray-600 mb-4">{product.description}</p>
                                <div className="flex items-center mb-4">
                                    <label htmlFor="modalQuantity" className="mr-3 text-gray-600">Số lượng:</label>
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button
                                            className="bg-gray-200 p-2"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >-</button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="text-center w-16 border-none focus:outline-none"
                                        />
                                        <button
                                            className="bg-gray-200 p-2"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >+</button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="bg-blue-600 text-white w-full p-2 rounded flex items-center justify-center hover:bg-blue-700 transition"
                                        onClick={handleAddToCart}
                                    >
                                        {addedToCart ? (
                                            <><i className="fa fa-check mr-2"></i> Đã thêm</>
                                        ) : (
                                            <><i className="fa fa-cart-plus mr-2"></i> Thêm vào giỏ</>
                                        )}
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white w-full p-2 rounded hover:bg-gray-700 transition"
                                        onClick={handleBuyNow}
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;