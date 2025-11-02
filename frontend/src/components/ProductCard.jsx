"use client"
import { Link } from "react-router-dom"

const formatCurrency = (v) => (v ?? 0).toLocaleString("vi-VN")



export default function ProductCard({ product }) {
  const { _id, productName, imageUrl, unitPrice,listPrice } = product

  const promoPrice = product.listPrice ?? null;
  const price     = product.unitPrice ?? 0;
  const hasPromo  = promoPrice && price < promoPrice;
  const discountPercent = hasPromo ? Math.round(100 - (price / promoPrice) * 100) : 0;

  const promoLabel  = product.promoLabel || product.promo?.label || '';
  const weightLabel = product.weightLabel || product.promo?.weight || '';


  return (
    <Link
      to={`/product/${_id}`}
      className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Ảnh: chiều cao cố định để không phóng quá to */}
      <div className="relative rounded-md overflow-hidden">
        {/* Badge khuyến mãi */}
        {hasPromo && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow ring-1 ring-white/80">
            -{discountPercent}%
          </span>
        )}

        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          decoding="async"
          className="w-full aspect-[4/3] object-contain bg-white"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-[13px] sm:text-sm font-medium line-clamp-2 min-h-[36px]">
          {productName}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-semibold text-green-700">
            {formatCurrency(price)}₫
          </span>
          {hasPromo && (
            <span className="text-gray-400 line-through text-sm">
              {formatCurrency(promoPrice)}₫
            </span>
          )}
        </div>

        <button
          className="mt-3 w-full rounded-lg bg-green-600 text-white py-2 text-xs sm:text-sm font-medium hover:bg-green-700"
          type="button"
        >
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  )
}
