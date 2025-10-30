"use client"
import ProductCard from "./ProductCard"

export default function ProductCarouselSection({ id, title, products = [], link }) {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h2>
        {link && (
          <a href={link} className="text-green-700 text-sm hover:underline">
            Xem tất cả
          </a>
        )}
      </div>

      {/* Mỗi item có độ rộng cố định (px) theo breakpoint để card không bị to quá */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 -mx-3 px-3">
        {products.slice(0, 20).map((p) => (
          <div
            key={p._id}
            className="
              snap-start
              min-w-[150px] max-w-[150px]
              sm:min-w-[180px] sm:max-w-[180px]
              md:min-w-[200px] md:max-w-[200px]
            "
          >
            <ProductCard product={p} />
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-gray-500">Chưa có sản phẩm phù hợp</div>
        )}
      </div>
    </section>
  )
}
