import React, { useEffect } from 'react';
import { formatPrice, getProductIcon } from '../assets/js/utils.jsx';
import { getCart, removeFromCart } from "../assets/js/cartManager.jsx";

const CartSidebar = ({ isOpen, onClose }) => {
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);

    useEffect(() => {
        if (isOpen) {
            updateCart();
        }
    }, [isOpen]);

    const updateCart = () => {
        const currentCart = getCart();
        setCart(currentCart);

        const cartTotal = currentCart.reduce((sum, item) =>
            sum + (item.product.price * item.quantity), 0);
        setTotal(cartTotal);
    };

    const handleRemoveItem = (index) => {
        removeFromCart(index);
        updateCart();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 w-full md:w-96 bg-white shadow-lg z-50 h-full">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Giỏ hàng</h3>
                    <button onClick={onClose} className="text-gray-600">
                        <i className="fa fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-grow overflow-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <i className="fa fa-shopping-cart text-5xl mb-4"></i>
                            <p>Giỏ hàng của bạn đang trống</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.product.id}-${index}`} className="flex items-start py-4 border-b">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                                    <i className={`${getProductIcon(item.product)} text-3xl text-gray-600`}></i>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-medium">{item.product.name}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-gray-600 text-sm">
                                            <span>{formatPrice(item.product.price)}</span>
                                            <span className="mx-1">×</span>
                                            <span>{item.quantity}</span>
                                        </div>
                                        <span className="font-medium">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="text-gray-600 hover:text-red-600 p-1 ml-2"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t">
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="font-bold">{formatPrice(total)}</span>
                    </div>
                    <button
                        className={`w-full bg-blue-600 text-white p-2 rounded ${
                            cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={cart.length === 0}
                        onClick={() => alert('Chức năng thanh toán đang được phát triển!')}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartSidebar;