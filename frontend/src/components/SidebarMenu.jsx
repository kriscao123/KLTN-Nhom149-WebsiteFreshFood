import React, { useState } from 'react';

const SidebarMenu = ({ categories }) => {
  const [openCategory, setOpenCategory] = useState(null); // Để lưu trữ danh mục đang mở

  // Hàm để toggle mở/đóng danh mục
  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId); // Nếu danh mục đang mở, đóng lại
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-2xl font-bold text-gray-700 mb-6">DANH MỤC SẢN PHẨM</h3>
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="mb-4">
            <div 
              className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 hover:bg-gray-100 py-2 px-3 rounded-md"
              onClick={() => toggleCategory(category.title)} // Toggle danh mục khi nhấp vào
            >
              <span>{category.title}</span>
              <span>{openCategory === category.title ? '▲' : '▼'}</span>
            </div>

            {/* Hiển thị các mục con nếu danh mục được mở */}
            {openCategory === category.title && (
              <ul className="ml-4 mt-2">
                {category.subCategories.map((subCategory, subIndex) => (
                  <li key={subIndex} className="text-sm text-gray-600 hover:underline py-1">
                    <button
                      type="button"
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                      onClick={() => {
                        if (subCategory.link === "/khuyenmai") {
                          const el = document.getElementById("section-promo");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                    >
                      {subCategory.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
