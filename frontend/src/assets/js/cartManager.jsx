import { updateLocalStorage, getFromLocalStorage } from './storageUtils.js';

// Shopping cart functionality
let cart = [];

// Initialize cart from localStorage if available
export function initCart() {
    const savedCart = getFromLocalStorage('cart');
    if (savedCart) {
        cart = savedCart;
    }
}

// Add product to cart
export function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ product, quantity });
    }

    updateCartBadge();
    updateLocalStorage('cart', cart);

    return [...cart]; // Return a copy of the updated cart
}

// Update cart badge
export function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (!cartBadge) return;

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : '';
    cartBadge.classList.toggle('hidden', itemCount === 0);
}

// Remove item from cart
export function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCartBadge();
        updateLocalStorage('cart', cart);
    }

    return [...cart]; // Return a copy of the updated cart
}

// Toggle cart sidebar
export function toggleCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar) return;

    cartSidebar.classList.toggle('translate-x-full');
    document.body.style.overflow = cartSidebar.classList.contains('translate-x-full') ? '' : 'hidden';
}

// Get cart
export function getCart() {
    return [...cart]; // Return a copy of the cart array
}

// Clear cart
export function clearCart() {
    cart = [];
    updateCartBadge();
    updateLocalStorage('cart', cart);
    return []; // Return an empty array
}

// Initialize cart on load
initCart();