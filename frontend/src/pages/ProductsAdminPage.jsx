"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../services/api.js";
import AddProductModal from "../components/AddProductModal.jsx";

const PAGE_SIZE = 10;

// --- helpers ---
const safeLower = (v) => (v ?? "").toString().toLowerCase().trim();

const toNumber = (v) => {
  // hỗ trợ "1,000,000" hoặc "1.000.000"
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/[^\d.-]/g, ""); // bỏ ký tự lạ
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(toNumber(amount));

const normalizeProduct = (p) => {
  // ✅ Bạn chỉnh mapping theo backend của bạn tại đây
  const id = p._id || p.productId || p.id;
  return {
    id: String(id ?? ""),
    productName: p.productName ,
    category: p.categoryId ,
    imageUrl: p.imageUrl,
    unitPrice: toNumber(p.listPrice|| 0),
    salePrice: toNumber(p.unitPrice||0),
    stock: toNumber(p.unitsInStock ?? 0),
    createdAt: p.createdAt ?? p.createdDate ?? null,
    raw: p, // giữ raw nếu cần
  };
};

export default function ProductAdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0); // 0-based
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(PAGE_SIZE);
    const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/products?page=${currentPage}&size=${pageSize}`);

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
          ? res.data.content
          : [];

      const normalized = raw.map(normalizeProduct).filter((p) => p.id); // bỏ item không có id
      setProducts(normalized);
      console.log("Fetched products:", normalized);

      const tp =
        Array.isArray(res.data)
          ? Math.max(1, Math.ceil(raw.length / pageSize))
          : Number(res.data?.totalPages) || 1;

      setTotalPages(tp);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải products. Kiểm tra API /products.");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(currentPage) || currentPage < 0) setCurrentPage(0);
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
    const fetchCategories = async () => {
        const res = await api.get("/categories");
        const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCategories(data);
    };
    fetchCategories();
    }, [currentPage, pageSize]);

  const filtered = useMemo(() => {
    const q = safeLower(query);
    if (!q) return products;

    return products.filter((p) => {
      return (
        safeLower(p.productName).includes(q) ||
        safeLower(p.category).includes(q) ||
        safeLower(p.id).includes(q)
      );
    });
  }, [products, query]);

  const categoryNameById = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
        const id = String(c._id || c.categoryId || "");
        const name = c.name || c.categoryName || c.title;
        if (id) m.set(id, name);
    }
    return m;
    }, [categories]);


  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;

    const cmp = (a, b) => {
      const sign = dir === "asc" ? 1 : -1;

      if (key === "unitPrice" || key === "salePrice" || key === "stock") {
        return (toNumber(a[key]) - toNumber(b[key])) * sign;
      }

      if (key === "createdAt") {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (da - db) * sign;
      }

      return safeLower(a[key]).localeCompare(safeLower(b[key])) * sign;
    };

    arr.sort(cmp);
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ CSV chuẩn Excel: BOM + ; + quote full fields
  const exportCSV = () => {
    const SEP = ";";
    const esc = (v) => `"${String(v ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""')}"`;

    const header = ["ID", "Tên sản phẩm", "Danh mục", "Giá gốc", "Giá sale", "Tồn kho"];
    const rows = sorted.map((p) => [
      p.id,
      p.productName,
      p.category,
      p.unitPrice,
      p.salePrice,
      p.stock,
    ]);

    const lines = [
      `sep=${SEP}`,
      header.map(esc).join(SEP),
      ...rows.map((r) => r.map(esc).join(SEP)),
    ];

    const csv = "\ufeff" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("Xóa sản phẩm này?");
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      if (products.length === 1 && currentPage > 0) setCurrentPage((p) => p - 1);
      else fetchProducts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
            <p className="text-gray-600 text-sm">Tìm kiếm, sắp xếp, xuất CSV, chỉnh sửa/xóa sản phẩm</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </button>

          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên / danh mục / id..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-800 border-b border-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ảnh</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSort("productName")}
                  >
                    Tên sản phẩm
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSort("category")}
                  >
                    Danh mục
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSort("unitPrice")}
                  >
                    Giá gốc
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSort("salePrice")}
                  >
                    Giá sale
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSort("stock")}
                  >
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Không có sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  sorted.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-md border bg-gray-50 overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{p.productName}</div>
                        <div className="text-xs text-gray-500">ID: {p.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{categoryNameById.get(String(p.category))  || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(p.unitPrice)}</td>
                      <td className="px-6 py-4 text-sm text-indigo-700 font-medium text-right">
                        {p.salePrice ? formatCurrency(p.salePrice) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{p.stock}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 inline-flex items-center gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-2 rounded-md border border-rose-300 hover:bg-rose-50 text-rose-700 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang <span className="font-medium">{currentPage + 1}</span> /{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1"
                onClick={() => setCurrentPage((p) => Math.max(0, Number(p) - 1))}
                disabled={currentPage <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              <button
                className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, Number(p) + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Tiếp
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <AddProductModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={() => {
            fetchProducts();
          }}
        />
      </div>
    </div>
  );
}
