// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    corePlugins: {
        color: {
            oklch: false, // Vô hiệu hóa oklch
        },
    },
    theme: {
        extend: {
            colors: {
                'indigo-50': '#E0E7FF',
                'indigo-100': '#C7D2FE',
                'indigo-600': '#4F46E5',
                'indigo-700': '#4338CA',
                'indigo-800': '#3730A3',
                'indigo-900': '#312E81',
                'purple-50': '#DDD6FE',
                'purple-100': '#C7D2FE',
                'purple-600': '#9333EA',
                'purple-700': '#7E22CE',
                'pink-50': '#FCE7F3',
                'pink-100': '#FBCFE8',
                'red-100': '#FEE2E2',
                'red-300': '#FCA5A5',
                'green-50': '#F0FDF4',
                'green-100': '#D1FAE5',
                'green-600': '#16A34A',
                'green-700': '#15803D',
                'gray-300': '#D1D5DB',
                'gray-600': '#4B5563',
                'gray-800': '#1F2937',
            },
        },
    },
    plugins: [],
}