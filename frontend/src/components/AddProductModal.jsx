// frontend/src/components/AddProductModal.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AddProductModal({ open, onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    categoryId: "",
    unitPrice: "",
    unitWeight: "",
    unitsInStock: "",
    listPrice: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // load danh mục khi mở modal
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await api.get("/categories");
        const data = Array.isArray(res.data) ? res.data : res.data.categories || [];
        setCategories(data);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    })();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  
  const name = form.productName.trim();
  const desc = form.description.trim();

  
  const unitPrice = Number(form.unitPrice);
  const listPrice = Number(form.listPrice);
  const unitsInStock = Number(form.unitsInStock);
  const unitWeight = Number(form.unitWeight);

  
  if (!name) {
    setError("Vui lòng nhập tên sản phẩm");
    return;
  }
  if (!form.categoryId) {
    setError("Vui lòng chọn danh mục");
    return;
  }
  if (!desc) {
    setError("Vui lòng nhập mô tả sản phẩm");
    return;
  }
  if (!imageFile) {
    setError("Vui lòng chọn ảnh sản phẩm");
    return;
  }

  
  if (!unitPrice || unitPrice <= 0) {
    setError("Giá bán (unitPrice) phải là số lớn hơn 0");
    return;
  }
  if (!listPrice || listPrice <= 0) {
    setError("Giá niêm yết (listPrice) phải là số lớn hơn 0");
    return;
  }
  if (!unitsInStock || unitsInStock <= 0) {
    setError("Tồn kho (unitsInStock) phải là số lớn hơn 0");
    return;
  }
  if (!unitWeight || unitWeight <= 0) {
    setError("Khối lượng (unitWeight) phải là số lớn hơn 0");
    return;
  }

  try {
    setIsSubmitting(true);

    // Upload ảnh
    const fd = new FormData();
    fd.append("file", imageFile);
    const uploadRes = await api.post("/upload/single", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const imageUrl = uploadRes.data?.imageUrl;

    
    const payload = {
      productName: name,
      categoryId: form.categoryId,
      unitPrice,
      listPrice,
      unitsInStock,
      unitWeight,
      description: desc,
      imageUrl,
      isActive: true,
      reorderLevel: 10,
      unitsOnOrder: 0,
      salesCount: 0,
    };

    const res = await api.post("/products", payload);

    // Thực hiện hành động sau khi thêm sản phẩm thành công
    onCreated?.(res.data);  // Gọi callback từ parent để thực hiện thêm hành động

    // Đóng modal sau khi thành công
    onClose?.();  // Đảm bảo modal được đóng sau khi thêm sản phẩm

    setForm({
      productName: "",
      categoryId: "",
      unitPrice: "",
      unitWeight: "",
      unitsInStock: "",
      listPrice: "",
      description: "",
    });
    setImageFile(null);
    
  } catch (err) {
    console.error("Lỗi tạo sản phẩm:", err);
    setError(err.response?.data?.message || "Lỗi tạo sản phẩm");
  } finally {
    setIsSubmitting(false);  
  }
};



  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Thêm sản phẩm mới</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onClose?.()}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => {
                  const id = String(c._id || c.categoryId || "");
                  const name = c.name || c.categoryName || c.title || id;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">Giá bán (unitPrice)</label>
              <input
                type="number"
                name="unitPrice"
                value={form.unitPrice}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">Giá niêm yết (listPrice)</label>
              <input
                type="number"
                name="listPrice"
                value={form.listPrice}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

           
            <div>
              <label className="block text-sm font-medium mb-1">Khối lượng (kg)</label>
              <input
                type="number"
                step="0.01"
                name="unitWeight"
                value={form.unitWeight}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">Tồn kho (unitsInStock)</label>
              <input
                type="number"
                name="unitsInStock"
                value={form.unitsInStock}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium mb-1">Ảnh sản phẩm</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm "
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm"
              onClick={() => onClose?.()}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
