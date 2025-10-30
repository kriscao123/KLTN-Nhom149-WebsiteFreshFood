import React from 'react';

const CategoryMenuGrid = ({ items, scrollToCategory }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer"
          onClick={() => scrollToCategory(index)} // Cuộn đến sản phẩm tương ứng khi nhấn vào category
        >
          <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryMenuGrid;
