"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import aiApi from "../services/aiApi.js";
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingCart, CheckCircle, AlertTriangle, X } from "lucide-react";
import { getUserFromLocalStorage } from "../assets/js/userData";


const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = getUserFromLocalStorage();
  const userId = user?.userId || null;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy chi tiết sản phẩm từ API backend chính
        const productResponse = await api.get(`/products/${id}`,{
          params: { userId:userId||undefined }
        });
        const productData = productResponse.data;
        setProduct(productData);

        // Lấy sản phẩm tương tự từ API AI
        try {
          const aiResponse = await aiApi.get(`/recommendations/${id}`);
          const recommendedProducts = aiResponse.data?.recommended_products || [];
          setSimilarProducts(recommendedProducts);
        } catch (aiErr) {
          console.error("Lỗi khi gọi API AI gợi ý sản phẩm:", aiErr);

          // Fallback: nếu AI lỗi thì lấy sản phẩm cùng danh mục từ backend Node
          try {
            const similarResponse = await api.get("/products", {
              params: { categoryId: productData.categoryId, size: 100 },
            });
            const similarProductsData = similarResponse.data.filter(
              (item) => item._id !== id && item.unitsInStock > 0
            );
            setSimilarProducts(similarProductsData);
          } catch (fallbackErr) {
            console.error("Lỗi khi lấy sản phẩm tương tự (fallback):", fallbackErr);
            setSimilarProducts([]);
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
        setError(err.response?.data?.message || "Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.unitsInStock) setQuantity(quantity + 1);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const addToCart = async () => {
    if (!userId) {
      showNotification("error", "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    if (quantity > product.unitsInStock) {
      showNotification("error", "Số lượng vượt quá số lượng tồn kho.");
      return;
    }

    setIsAddingToCart(true);
    try {

      let response;

      response = await api.put("/cart/add", {
          userId,
          productId: id,
          quantity: quantity,
          price: product.unitPrice,
        });

        console.log("Response from add to cart:", response.data.message);
      if (response?.data?.message) {
        showNotification("success", "Đã thêm sản phẩm vào giỏ hàng.");
      } else {
        showNotification("error", response.data.message || "Không thể thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      showNotification("error", "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!userId) {
      showNotification("error", "Bạn cần đăng nhập để mua hàng.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    if (quantity > product.unitsInStock) {
      showNotification("error", "Số lượng vượt quá số lượng tồn kho.");
      return;
    }

    setIsAddingToCart(true);
    try {
      const isChecked = product.isChecked;
      let response;

      if (!isChecked && quantity > 1) {
        response = await api.post("/cart/add", {
          userId,
          productId: id,
          quantity: quantity,
        });
      } else {
        response = await api.post("/cart/add", {
          userId,
          productId: id,
          quantity: isChecked ? quantity : 1,
        });
      }

      if (!response.data.success) {
        showNotification("error", response.data.message || "Không thể xử lý mua ngay.");
        return;
      }

      const itemId = response.data.cartItems[0].cartItemId;
      navigate(`/checkout?items=${itemId}`);
    } catch (error) {
      console.error("Lỗi khi xử lý mua ngay:", error);
      showNotification("error", "Không thể xử lý yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-b from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-6 text-lg font-medium text-gray-700">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-b from-blue-50 to-gray-100">
        <h2 className="text-3xl font-bold text-gray-800">Sản phẩm không tồn tại</h2>
        <p className="mt-2 text-gray-600">{error || `Không tìm thấy sản phẩm với ID #${id}`}</p>
        <Link
          to="/products"
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.unitPrice && product.unitPrice > 0 && product.oldPrice && product.oldPrice > product.unitPrice
      ? Math.round(((product.oldPrice - product.unitPrice) / product.oldPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
                <div
                    className={`fixed top-20 right-4 mt-9 z-50 p-4 rounded-md shadow-lg max-w-md flex items-center justify-between ${
                        notification.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    <div className="flex items-center">
                        {notification.type === "success" ? (
                            <CheckCircle size={20} className="text-green-500 mr-3" />
                        ) : (
                            <AlertTriangle size={20} className="text-red-500 mr-3" />
                        )}
                        <p>{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>
            )}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
          <ChevronRight className="w-4 h-4" />
          <Link to="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-indigo-600">
            Sản phẩm
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{product.productName}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Cột ảnh sản phẩm */}
        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="mt-4 flex items-center justify-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span>Còn {product.unitsInStock || 0} sản phẩm</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div>Đã bán: {product.salesCount || 0}</div>
          </div>
        </div>

        {/* Cột thông tin chi tiết */}
        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.productName}</h1>

            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl md:text-3xl font-extrabold text-indigo-600">
                {product.unitPrice.toLocaleString("vi-VN")}₫
              </div>
              {product.oldPrice && product.oldPrice > product.unitPrice && (
                <>
                  <div className="text-sm text-gray-400 line-through">
                    {product.oldPrice.toLocaleString("vi-VN")}₫
                  </div>
                  {discountPercent && (
                    <div className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full font-semibold">
                      -{discountPercent}%
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-gray-700 flex items-start">
              <CheckCircle className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Sản phẩm tươi ngon, đảm bảo chất lượng</p>
                <p className="mt-1 text-gray-600">
                  NH Food cam kết mang đến thực phẩm an toàn, nguồn gốc rõ ràng và quy trình bảo quản đạt chuẩn.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={decreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Tồn kho: <span className="font-semibold text-gray-800">{product.unitsInStock || 0}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={addToCart}
                disabled={isAddingToCart || product.unitsInStock <= 0}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-full font-semibold shadow-md transition-all ${
                  product.unitsInStock <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-amber-400 hover:bg-amber-500 text-gray-900"
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart || product.unitsInStock <= 0}
                className={`flex-1 px-4 py-3 rounded-full font-semibold shadow-md transition-all ${
                  product.unitsInStock <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isAddingToCart ? "Đang xử lý..." : "Mua ngay"}
              </button>
            </div>

            {product.unitsInStock <= 0 && (
              <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-2xl">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Sản phẩm hiện đã hết hàng. Vui lòng quay lại sau.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sản phẩm tương tự */}
      <div className="max-w-6xl mx-auto px-4 pb-10 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm tương tự</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {similarProducts.length > 0 ? (
            similarProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="m-5 h-80 mx-auto object-contain transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.productName}
                  </h3>
                  <div className="mt-2 font-bold text-indigo-600">{item.unitPrice.toLocaleString("vi-VN")}₫</div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center">Không có sản phẩm tương tự</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
