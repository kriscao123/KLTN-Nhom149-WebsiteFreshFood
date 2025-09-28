"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api.js"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, X } from "lucide-react"
import { getUserFromLocalStorage } from "../assets/js/userData"

const CartPage = () => {
    const [cartItems, setCartItems] = useState([])
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [notification, setNotification] = useState(null)
    const [selectedItems, setSelectedItems] = useState(new Set())

    const user = getUserFromLocalStorage()
    const userId = user?.userId || null  // Sửa lại để lấy userId thay vì email

    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const cartResponse = await api.get(`/carts/user/${userId}`)
                if (cartResponse.data && cartResponse.data.cartItems) {
                    setCartItems(cartResponse.data.cartItems)
                } else {
                    setCartItems([])
                }

                const productResponse = await api.get(`/products?page=0&size=1000`)
                if (productResponse.data && productResponse.data.content) {
                    setProducts(productResponse.data.content)
                } else {
                    setProducts([])
                }
            } catch (err) {
                console.error("Error fetching data:", err)
                setError("Không thể tải giỏ hàng hoặc sản phẩm. Vui lòng thử lại sau.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [userId])

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return

        try {
            setIsUpdating(true)
            const response = await api.put(`/carts/items/${cartItemId}`, { quantity: newQuantity })
            if (response.data && response.data.cartItems) {
                setCartItems(response.data.cartItems)
                window.dispatchEvent(new Event("cartUpdated"))
            }
            showNotification("success", "Cập nhật số lượng thành công!")
        } catch (err) {
            console.error("Error updating cart:", err)
            showNotification("error", "Không thể cập nhật số lượng. Vui lòng thử lại.")
        } finally {
            setIsUpdating(false)
        }
    }

    const confirmDelete = (item) => {
        setItemToDelete(item)
        setShowConfirmDelete(true)
    }

    const cancelDelete = () => {
        setItemToDelete(null)
        setShowConfirmDelete(false)
    }

    const removeItem = async () => {
        if (!itemToDelete) return

        try {
            setIsUpdating(true)
            await api.delete(`/carts/items`, {
                data: { userId, productId: itemToDelete.productId }
            })
            setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== itemToDelete.cartItemId))
            setSelectedItems((prev) => {
                const newSet = new Set(prev)
                newSet.delete(itemToDelete.cartItemId)
                return newSet
            })
            window.dispatchEvent(new Event("cartUpdated"))
            showNotification("success", `Đã xóa ${itemToDelete.productName} khỏi giỏ hàng`)
        } catch (err) {
            console.error("Error removing item:", err)
            showNotification("error", "Không thể xóa sản phẩm. Vui lòng thử lại sau.")
        } finally {
            setIsUpdating(false)
            setShowConfirmDelete(false)
            setItemToDelete(null)
        }
    }

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const calculateSelectedSummary = () => {
        const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.cartItemId))
        const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = selectedCartItems.reduce((total, item) => {
            const productInfo = getProductInfo(item.productId)
            return total + (productInfo.salePrice || 0) * item.quantity
        }, 0)
        return { totalItems, subtotal }
    }

    const toggleItemSelection = (itemId) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) newSet.delete(itemId)
            else newSet.add(itemId)
            return newSet
        })
    }

    const toggleSelectAll = () => {
        if (selectedItems.size === cartItems.length) setSelectedItems(new Set())
        else setSelectedItems(new Set(cartItems.map((item) => item.cartItemId)))
    }

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            showNotification("error", "Vui lòng chọn ít nhất một sản phẩm để thanh toán.")
            return
        }
        const itemIds = Array.from(selectedItems)
        navigate(`/checkout?items=${itemIds.join(",")}`)
    }

    const getProductInfo = (productId) => {
        const product = products.find((p) => p.productId === productId)
        return product || { imageUrl: null, categoryId: "N/A", salePrice: 0 }
    }

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <ShoppingBag size={64} className="text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h1>
                        <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem giỏ hàng của bạn</p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/products"
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <ShoppingBag size={64} className="text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h1>
                        <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                        <Link
                            to="/products"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <ShoppingBag size={64} className="text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h1>
                        <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                        <Link
                            to="/products"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const { totalItems, subtotal } = calculateSelectedSummary()
    const shippingFee = 30000
    const total = subtotal + shippingFee

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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

            {showConfirmDelete && itemToDelete && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa sản phẩm</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa{" "}
                            <span className="font-medium">{itemToDelete.productName}</span> khỏi giỏ hàng?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isUpdating}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={removeItem}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} className="mr-2" />
                                        Xóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800">Sản phẩm ({cartItems.length})</h2>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === cartItems.length}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Chọn tất cả</span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => {
                                    const productInfo = getProductInfo(item.productId)
                                    return (
                                        <div key={item.cartItemId} className="p-6 flex flex-col sm:flex-row items-center">
                                            <div className="w-6 flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item.cartItemId)}
                                                    onChange={() => toggleItemSelection(item.cartItemId)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden ml-4">
                                                <img
                                                    src={productInfo.imageUrl || "/placeholder.svg?height=96&width=96"}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover object-center"
                                                />
                                            </div>

                                            <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-800">{item.productName}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">{productInfo.categoryId}</p>
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-900 mt-2 sm:mt-0">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(productInfo.salePrice)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center border border-gray-300 rounded-md">
                                                        <button
                                                            onClick={() => {
                                                                const newQuantity = item.quantity - 1
                                                                if (newQuantity >= 1) updateQuantity(item.cartItemId, newQuantity)
                                                            }}
                                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                            aria-label="Giảm số lượng"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value)
                                                                if (!isNaN(val) && val >= 1) updateQuantity(item.cartItemId, val)
                                                            }}
                                                            className="w-16 text-center border-x border-gray-300 py-1 outline-none"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newQuantity = item.quantity + 1
                                                                updateQuantity(item.cartItemId, newQuantity)
                                                            }}
                                                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                            aria-label="Tăng số lượng"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => confirmDelete(item)}
                                                        disabled={isUpdating}
                                                        className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                                                        aria-label="Xóa sản phẩm"
                                                    >
                                                        <Trash2 size={18} className="mr-1" />
                                                        <span>Xóa</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <Link to="/products" className="text-blue-600 hover:text-blue-800 flex items-center">
                                    <ArrowLeft size={18} className="mr-2" />
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Tạm tính ({totalItems} sản phẩm)
                                    </span>
                                    <span className="text-gray-800 font-medium">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="text-gray-800 font-medium">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shippingFee)}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-4 flex justify-between">
                                    <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isUpdating || selectedItems.size === 0}
                                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tiến hành thanh toán
                            </button>

                            <div className="mt-6 text-sm text-gray-500">
                                <p className="mb-2">Chúng tôi chấp nhận:</p>
                                <div className="flex space-x-2">
                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">VISA</div>
                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">MC</div>
                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">MOMO</div>
                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">COD</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage