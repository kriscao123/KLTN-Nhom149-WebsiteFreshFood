"use client"
import { Link } from "react-router-dom"

const formatCurrency = (v) => (v ?? 0).toLocaleString("vi-VN")

export default function ProductCard({ product }) {
  const { _id, productName, imageUrl, unitPrice } = product

  return (
    <Link
      to={`/product/${_id}`}
      className="group block bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Ảnh: chiều cao cố định để không phóng quá to */}
      <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-50 grid place-items-center overflow-hidden">
        <img
          src={imageUrl || "/img/placeholder.png"}
          alt={productName}
          className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-[13px] sm:text-sm font-medium line-clamp-2 min-h-[36px]">
          {productName}
        </h3>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-base sm:text-lg font-semibold text-green-700">
            {formatCurrency(unitPrice)}₫
          </span>
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
