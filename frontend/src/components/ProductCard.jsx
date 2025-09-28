import React from 'react';
import { formatPrice, generateRatingStars } from '../assets/js/utils.jsx';

const ProductCard = ({ product }) => {
    return (
        <div
            className="product-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform transform hover:scale-105"
        >
            <div className="bg-gray-100 h-48 flex items-center justify-center">
                <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="object-contain h-full"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-medium">{product.productName}</h3>

                {/* Nếu bạn không có rating hoặc reviewCount thì có thể ẩn phần này hoặc để mặc định */}
                <div className="flex items-center mb-2">
                    {/*<div*/}
                    {/*    className="text-yellow-500 mr-2"*/}
                    {/*    dangerouslySetInnerHTML={{ __html: generateRatingStars(4.5) }} // mặc định 4.5 sao*/}
                    {/*></div>*/}
                    <span className="text-gray-500 text-sm">Số lượng tồn: {product.quantityInStock}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">
                        {formatPrice(product.originalPrice)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
