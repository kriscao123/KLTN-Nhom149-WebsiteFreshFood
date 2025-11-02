import React from 'react';

const CategoryMenuGrid = ({ items, scrollToCategory }) => {
  return (
    <div className="section !my-3">
      <div className="cat-strip">
        <div className="cat-scroll flex items-stretch gap-4 no-scrollbar snap-x snap-mandatory px-3 py-3">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className="cat-item relative shrink-0 snap-start w-[104px] sm:w-[120px] md:w-[132px] rounded-2xl bg-white
             border border-gray-200 p-3 grid place-items-center text-center
             transition-all hover:shadow-md hover:border-emerald-200 active:scale-[.98]"
              onClick={() => scrollToCategory(index)}
              aria-label={item.title || `Danh mục ${index + 1}`}
              onKeyDown={(e) => { if (e.key === 'Enter') scrollToCategory(index); }}
            >

              <img
                src={item.image}
                alt={item.title || 'Danh mục'}
                className="cat-img h-16 w-16 md:h-20 md:w-20 object-contain"
                loading="lazy"
                decoding="async"
              />
              <div className="cat-title mt-2 text-[13px] md:text-sm leading-snug text-gray-700 line-clamp-2">{item.title}</div>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default CategoryMenuGrid;
