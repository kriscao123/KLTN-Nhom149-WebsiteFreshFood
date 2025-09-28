// Format price to Vietnamese currency
export function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

// Generate star rating HTML
export function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        Array(fullStars).fill('<i class="fas fa-star"></i>').join('') +
        (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
        Array(emptyStars).fill('<i class="far fa-star"></i>').join('')
    );
}

// Get icon for product
export function getProductIcon(product) {
    const iconMap = {
        "rice-cooker": "fa-solid fa-bowl-rice",
        "blender": "fa-solid fa-blender",
        "bed": "fa-solid fa-bed",
        "lamp": "fa-solid fa-lightbulb",
        "utensils": "fa-solid fa-utensils",
        "mirror": "fa-solid fa-circle",
        "shower": "fa-solid fa-shower",
        "couch": "fa-solid fa-couch",
        "coffee": "fa-solid fa-mug-hot",
        "pepper-hot": "fa-solid fa-pepper-hot",
        "window-maximize": "fa-solid fa-window-maximize"
    };

    return iconMap[product.icon] || "fa-solid fa-box";
}

// Set up dark mode detection
export function setupDarkMode() {
    const setDarkMode = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener('change', (event) => {
        setDarkMode(event.matches);
    });
}