"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Package,
    Truck,
    X,
    XCircle,
} from "lucide-react"
import api from "../services/api.js"

const Transport = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState(null)
    const [orders, setOrders] = useState([])
    const [users, setUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const ordersPerPage = 5

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    // Get delivery status background color
    const getDeliveryStatusBgColor = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "bg-green-500"
            default:
                return "bg-gray-500"
        }
    }

    // Get delivery status text
    const getDeliveryStatusText = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "Thanh toán thành công"
            default:
                return "Không xác định"
        }
    }

    // Get delivery status badge color
    const getDeliveryStatusBadgeColor = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "bg-green-100 text-green-800 border border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200"
        }
    }

    // Get delivery status icon
    const getDeliveryStatusIcon = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return <Package className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) {
            return "Không xác định"
        }

        const date = new Date(dateString)

        if (isNaN(date.getTime())) {
            return "Không xác định"
        }

        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    // Fetch data
    const fetchData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Fetch users
            const usersResponse = await api.get("/users")
            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : []
            console.log("Users data:", usersData)
            setUsers(usersData)

            // Fetch orders
            const orderResponse = await api.get("/orders")
            const orderData = Array.isArray(orderResponse.data) ? orderResponse.data : []
            console.log("Orders data:", orderData)
            setOrders(orderData)
        } catch (err) {
            console.error("Error fetching data:", err)
            setError(
                err.response?.data?.message ||
                "Không thể tải dữ liệu vận chuyển. Vui lòng thử lại."
            )
            showNotification("error", "Không thể tải dữ liệu vận chuyển")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Handle search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    // Filter orders based on search query
    const filteredOrders = orders.filter((order) => {
        const user = users.find((u) => u.email === order.userId)
        return (
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

    // If loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Đang tải dữ liệu...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    // If error
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white text-red-800 p-8 rounded-xl shadow-lg max-w-md">
                    <div className="flex items-center mb-6">
                        <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                        <h3 className="text-xl font-semibold">Đã xảy ra lỗi</h3>
                    </div>
                    <p className="mb-5 text-sm">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 bg-white border border-red-300 rounded-xl text-red-700 hover:bg-red-50 transition-all flex items-center justify-center"
                    >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl p-4">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg max-w-md flex items-center justify-between ${
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
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-4 text-gray-500 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Quản lý vận chuyển</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="rounded-md border border-gray-300 py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b px-4 py-3 sm:px-6">
                    <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Khách hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Địa chỉ giao
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Ngày giao
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                        {currentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-6 text-center text-gray-600 font-medium">
                                    Không tìm thấy đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            currentOrders.map((order) => {
                                const customer = users.find((u) => u.email === order.userId)
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {customer ? customer.username : "Không xác định"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{order.deliveryAddress}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-500">{formatDate(order.deliveryDate)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDeliveryStatusBadgeColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getDeliveryStatusIcon(order.status)}
                                                    <span className="ml-1">{getDeliveryStatusText(order.status)}</span>
                                                </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <Link href={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900">
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{currentOrders.length}</span> trong tổng số{" "}
                            <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Transport