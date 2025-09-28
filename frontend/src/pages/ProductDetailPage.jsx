"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import api from "../services/api.js"
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingCart, CheckCircle, AlertTriangle, X } from "lucide-react"
import { getUserFromLocalStorage } from "../assets/js/userData"

const ProductDetailPage = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [similarProducts, setSimilarProducts] = useState([])
    const [quantity, setQuantity] = useState(1)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [notification, setNotification] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const user = getUserFromLocalStorage()
    console.log(user)
    const userId = user?.userId || null

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true)
                const productResponse = await api.get(`/products/${id}`)
                const productData = productResponse.data
                setProduct(productData)

                const similarResponse = await api.get("/products", {
                    params: { categoryId: productData.categoryId, size: 100 },
                })
                const similarProductsData = similarResponse.data.content.filter(
                    (item) => item.productId !== id && item.quantityInStock > 0
                )
                setSimilarProducts(similarProductsData)
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", err)
                setError(err.response?.data?.message || "Không thể tải dữ liệu sản phẩm")
            } finally {
                setLoading(false)
            }
        }

        fetchProductData()
    }, [id])

    const [isInCart, setIsInCart] = useState(false)
    const [cartItemId, setCartItemId] = useState(null)
    const [cartQuantity, setCartQuantity] = useState(0)

    useEffect(() => {
        const checkCartStatus = async () => {
            if (!userId || !product) return

            try {
                const response = await api.get(`/carts/user/${userId}`)
                const cartItem = response.data.cartItems.find((item) => item.productId === id)
                if (cartItem) {
                    setIsInCart(true)
                    setCartItemId(cartItem.cartItemId)
                    setCartQuantity(cartItem.quantity)
                } else {
                    setIsInCart(false)
                    setCartItemId(null)
                    setCartQuantity(0)
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra giỏ hàng:", error)
                showNotification("error", "Không thể kiểm tra giỏ hàng. Vui lòng thử lại.")
            }
        }

        checkCartStatus()
    }, [userId, id, product])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-b from-blue-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <p className="mt-6 text-lg font-medium text-gray-700">Đang tải sản phẩm...</p>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-b from-blue-50 to-gray-100">
                <h2 className="text-3xl font-bold text-gray-800">Sản phẩm không tồn tại</h2>
                <p className="mt-2 text-gray-600">{error || `Không tìm thấy sản phẩm với ID #${id}`}</p>
                <Link
                    to="/products"
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                    Quay lại danh sách sản phẩm
                </Link>
            </div>
        )
    }

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1)
    }

    const increaseQuantity = () => {
        if (quantity < product.quantityInStock) setQuantity(quantity + 1)
    }

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleAddToCart = async () => {
        if (!userId) {
            showNotification("error", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.")
            navigate("/login")
            return
        }

        try {
            setIsAddingToCart(true)
            if (isInCart && cartItemId) {
                const newQuantity = cartQuantity + quantity
                await api.put(`/carts/items/${cartItemId}`, { quantity: newQuantity })
                setCartQuantity(newQuantity)
                showNotification("success", `Đã cập nhật số lượng "${product.productName}" trong giỏ hàng!`)
            } else {
                const payload = { userId, productId: id, quantity }
                const response = await api.post("/carts/items", payload)
                setIsInCart(true)
                setCartItemId(response.data.cartItems[0].cartItemId)
                setCartQuantity(quantity)
                showNotification("success", `Đã thêm ${quantity} "${product.productName}" vào giỏ hàng!`)
                window.dispatchEvent(new Event("cartUpdated"))
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error)
            showNotification("error", "Không thể thêm vào giỏ hàng. Vui lòng thử lại.")
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        if (!userId) {
            showNotification("error", "Vui lòng đăng nhập để tiếp tục thanh toán.")
            navigate("/login")
            return
        }

        try {
            setIsAddingToCart(true)
            let itemId = cartItemId
            if (!isInCart) {
                const payload = { userId, productId: id, quantity }
                const response = await api.post("/carts/items", payload)
                itemId = response.data.cartItems[0].cartItemId
            } else if (cartItemId) {
                await api.put(`/carts/items/${cartItemId}`, { quantity })
            }
            navigate(`/checkout?items=${itemId}`)
        } catch (error) {
            console.error("Lỗi khi xử lý mua ngay:", error)
            showNotification("error", "Không thể xử lý yêu cầu. Vui lòng thử lại.")
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleSimilarProductClick = (productId) => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        navigate(`/product/${productId}`)
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-blue-50 to-gray-100">
            {notification && (
                <div
                    className={`fixed top-20 mt-9 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md flex items-center justify-between ${
                        notification.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                    } animate-slide-in`}
                >
                    <div className="flex items-center">
                        {notification.type === "success" ? (
                            <CheckCircle size={20} className="text-green-600 mr-3" />
                        ) : (
                            <AlertTriangle size={20} className="text-red-600 mr-3" />
                        )}
                        <p>{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-4 text-gray-600 hover:text-gray-800">
                        <X size={18} />
                    </button>
                </div>
            )}

            <nav className="flex items-center text-sm text-gray-600 mb-6 bg-white py-3 px-4 rounded-lg shadow-sm">
                <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">
                    Trang chủ
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                <Link to="/products" className="hover:text-indigo-600 transition-colors font-medium">
                    Sản phẩm
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                <span className="text-indigo-700 font-semibold truncate">{product.productName}</span>
            </nav>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
                        <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-full h-100 object-contain transition-transform duration-200 hover:scale-95"
                        />
                    </div>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{product.productName}</h1>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline space-x-4">
                            <span className="text-3xl font-bold text-indigo-600">{product.originalPrice.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <p className="text-sm text-green-600 font-semibold">✓ Còn hàng: {product.quantityInStock} sản phẩm</p>
                        {isInCart && (
                            <p className="text-sm text-indigo-600 font-semibold mt-1">
                                ✓ Đã có {cartQuantity} sản phẩm trong giỏ hàng
                            </p>
                        )}
                    </div>

                    <div className="h-px w-full bg-gray-200"></div>

                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>

                        <div className="flex flex-wrap gap-3">
                            {["Giao hàng nhanh", "Bảo hành 12 tháng", "Đổi trả trong 7 ngày"].map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 text-sm rounded-full font-medium shadow-sm"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-200"></div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="w-24 text-gray-700 font-medium">Số lượng:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={decreaseQuantity}
                                    className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={isAddingToCart}
                                >
                                    <Minus className="h-4 w-4 text-gray-700" />
                                </button>
                                <div className="h-10 px-4 flex items-center justify-center bg-white w-12 text-center font-medium">
                                    {quantity}
                                </div>
                                <button
                                    onClick={increaseQuantity}
                                    className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={isAddingToCart || quantity >= product.quantityInStock}
                                >
                                    <Plus className="h-4 w-4 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || product.quantityInStock === 0}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {isInCart ? "Thêm sản phẩm vào giỏ hàng" : "Thêm vào giỏ hàng"}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isAddingToCart || product.quantityInStock === 0}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart ? "Đang xử lý..." : "Mua ngay"}
                            </button>
                        </div>

                        {product.quantityInStock === 0 && (
                            <div className="text-red-600 font-semibold text-center bg-red-100 py-2 rounded-lg">
                                Sản phẩm đã hết hàng
                            </div>
                        )}

                        {!userId && (
                            <div className="text-gray-700 text-sm text-center border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm">
                                Vui lòng <Link to="/login" className="text-indigo-600 font-semibold hover:underline">đăng nhập</Link> để thêm sản phẩm vào giỏ hàng
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Sản phẩm tương tự</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {similarProducts.length > 0 ? (
                        similarProducts.map((item) => (
                            <div
                                key={item.productId}
                                onClick={() => handleSimilarProductClick(item.productId)}
                                className="group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <img
                                        src={"/" + item.imageUrl}
                                        alt={item.productName}
                                        className="m-5 h-80 mx-auto object-contain transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {item.productName}
                                    </h3>
                                    <div className="mt-2 font-bold text-indigo-600">{item.salePrice.toLocaleString("vi-VN")}₫</div>
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
    )
}

export default ProductDetailPage