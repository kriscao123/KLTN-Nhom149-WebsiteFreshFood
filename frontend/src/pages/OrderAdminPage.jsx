"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Package,
    Truck,
    ShoppingBag,
    X,
    ChevronDown,
    ChevronUp,
    Download,
    RefreshCw,
    Filter,
    Calendar,
    MapPin,
    CreditCard,
    User,
    CheckCircle,
    Clock,
    AlertTriangle,
    XCircle,
    Printer,
    ArrowUpRight,
    ShoppingCart,
    DollarSign,
    Box,
    Zap,
} from "lucide-react"
import api from "../services/api.js"

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [dateFilter, setDateFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState({ key: "_id", direction: "desc" })
    const [stats, setStats] = useState({
        total: 0,
        paymentSuccess: 0,
        revenue: 0,
    })
    const [selectedCard, setSelectedCard] = useState(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch users
            const usersResponse = await api.get("/users")
            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : []
            console.log("Users data:", usersData)

            // Fetch products
            let productsData = []
            try {
                const productsResponse = await api.get("/products")
                console.log("Products response:", productsResponse)
                if (productsResponse && productsResponse.data) {
                    productsData = productsResponse.data
                    if (!Array.isArray(productsData)) {
                        productsData = productsData.content || []
                    }
                } else {
                    console.warn("Products response is empty or undefined")
                    productsData = []
                }
            } catch (productErr) {
                console.error("Error fetching products:", productErr)
                productsData = []
            }
            console.log("Processed products data:", productsData)

            // Fetch orders
            const ordersResponse = await api.get("/orders")
            const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : []
            console.log("Orders data:", ordersData)

            // Process orders
            const processedOrders = ordersData.map((order) => {
                const user = usersData.find((u) => u.email === order.userId) || {
                    username: "Không xác định",
                    email: "N/A",
                }
                const details = order.orderDetails?.map((detail) => {
                    const product = Array.isArray(productsData)
                        ? productsData.find((p) => p.productId.toString() === detail.productId.toString()) || null
                        : null
                    return {
                        ...detail,
                        productName: product ? product.productName : `Sản phẩm #${detail.productId}`,
                        productImage: product ? product.imageUrl : null,
                        productPrice: product ? product.salePrice : detail.unitPrice,
                    }
                }) || []

                return {
                    ...order,
                    userFullName: user.username,
                    userEmail: user.email,
                    details,
                }
            })

            // Calculate stats
            const statsData = {
                total: processedOrders.length,
                paymentSuccess: processedOrders.filter((o) => o.status === "PAYMENT_SUCCESS").length,
                revenue: processedOrders
                    .filter((o) => o.status === "PAYMENT_SUCCESS")
                    .reduce((sum, order) => sum + Number(order.totalAmount), 0),
            }

            setUsers(usersData)
            setProducts(productsData)
            setOrders(processedOrders)
            setStats(statsData)

            if (processedOrders.length > 0 && !selectedOrder) {
                setSelectedOrder(processedOrders[0])
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err)
            setError(
                err.response?.data?.message ||
                `Lỗi khi tải dữ liệu: ${err.message}. Vui lòng kiểm tra API và phản hồi.`,
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSelectOrder = (order) => {
        setSelectedOrder(order)
    }

    const handleSelectCard = (cardType) => {
        setSelectedCard(cardType === selectedCard ? null : cardType)
        if (cardType !== selectedCard) setSelectedOrder(null)
    }

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDate = dateFilter
            ? (() => {
                try {
                    const [day, month, year] = dateFilter.split("/")
                    const filterDate = new Date(`${year}-${month}-${day}`)
                    const orderDate = new Date(order.deliveryDate)
                    return (
                        filterDate.getFullYear() === orderDate.getFullYear() &&
                        filterDate.getMonth() === orderDate.getMonth() &&
                        filterDate.getDate() === orderDate.getDate()
                    )
                } catch {
                    return true
                }
            })()
            : true

        const matchesStatus = statusFilter ? order.status === statusFilter : true

        return matchesSearch && matchesDate && matchesStatus
    })

    const cardFilteredOrders = selectedCard
        ? filteredOrders.filter((order) => {
            switch (selectedCard) {
                case "total":
                    return true
                case "revenue":
                case "paymentSuccess":
                    return order.status === "PAYMENT_SUCCESS"
                default:
                    return order.status === selectedCard
            }
        })
        : filteredOrders

    const sortedOrders = [...cardFilteredOrders].sort((a, b) => {
        if (!selectedCard) {
            if (a.status === "PAYMENT_SUCCESS" && b.status !== "PAYMENT_SUCCESS") return -1
            if (a.status !== "PAYMENT_SUCCESS" && b.status === "PAYMENT_SUCCESS") return 1
            if (a._id !== b._id) {
                return sortConfig.direction === "asc"
                    ? a._id.toString().localeCompare(b._id.toString())
                    : b._id.toString().localeCompare(a._id.toString())
            }
            return new Date(b.deliveryDate) - new Date(a.deliveryDate)
        }

        if (sortConfig.key === "totalAmount") {
            return sortConfig.direction === "asc"
                ? a.totalAmount - b.totalAmount
                : b.totalAmount - a.totalAmount
        }
        if (sortConfig.key === "deliveryDate") {
            return sortConfig.direction === "asc"
                ? new Date(a.deliveryDate) - new Date(b.deliveryDate)
                : new Date(b.deliveryDate) - new Date(a.deliveryDate)
        }
        return sortConfig.direction === "asc"
            ? a._id.toString().localeCompare(b._id.toString())
            : b._id.toString().localeCompare(a._id.toString())
    })

    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
        }))
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Không xác định"
        const date = new Date(dateString)
        return isNaN(date.getTime())
            ? "Không xác định"
            : date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "bg-emerald-100 text-emerald-800 border border-emerald-200"
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200"
        }
    }

    const getStatusBgColor = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "bg-emerald-500"
            default:
                return "bg-gray-500"
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return "Thanh toán thành công"
            default:
                return "Không xác định"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS":
                return <CheckCircle className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    const getPaymentMethodText = (methodId) => {
        switch (methodId) {
            case "PM001":
                return "Thanh toán khi nhận hàng (COD)"
            case "PM002":
                return "Chuyển khoản ngân hàng"
            case "PM003":
                return "Ví điện tử (MoMo, ZaloPay)"
            case "PM004":
                return "Thẻ tín dụng/ghi nợ"
            default:
                return "Không xác định"
        }
    }

    const getPaymentMethodIcon = (methodId) => {
        switch (methodId) {
            case "PM001":
                return <DollarSign className="h-4 w-4" />
            case "PM002":
                return <CreditCard className="h-4 w-4" />
            case "PM003":
                return <Zap className="h-4 w-4" />
            case "PM004":
                return <CreditCard className="h-4 w-4" />
            default:
                return <CreditCard className="h-4 w-4" />
        }
    }

    const exportToCSV = () => {
        const headers = ["Mã đơn", "Khách hàng", "Địa chỉ", "Tổng tiền", "Ngày giao", "Trạng thái"]
        const csvContent = [
            headers.join(","),
            ...cardFilteredOrders.map((order) =>
                [
                    order._id,
                    `"${order.userFullName.replace(/"/g, '""')}"`,
                    `"${order.deliveryAddress.replace(/"/g, '""')}"`,
                    order.totalAmount,
                    formatDate(order.deliveryDate),
                    getStatusText(order.status),
                ].join(","),
            ),
        ].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `don-hang-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrintInvoice = () => {
        if (!selectedOrder) return
        const printWindow = window.open("", "_blank", "width=800,height=600")
        const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn #${selectedOrder._id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .invoice-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
          .invoice-header h1 { color: #4338ca; margin-bottom: 5px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-info-block { max-width: 50%; }
          .invoice-info-block h4 { margin-bottom: 5px; color: #4338ca; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table th { background-color: #f3f4f6; text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
          .invoice-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .invoice-table .amount { text-align: right; }
          .invoice-table img { max-width: 50px; height: auto; object-fit: cover; }
          .invoice-total { margin-top: 20px; text-align: right; }
          .invoice-total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; }
          .invoice-total-row .label { width: 150px; text-align: left; }
          .invoice-total-row .value { width: 150px; text-align: right; }
          .invoice-total-row.final { font-weight: bold; font-size: 1.2em; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; color: #4338ca; }
          .invoice-footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.9em; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>HÓA ĐƠN BÁN HÀNG</h1>
          <p>Ngày đặt hàng: ${formatDate(selectedOrder.createdDate)}</p>
        </div>
        <div class="invoice-info">
          <div class="invoice-info-block">
            <h4>Thông tin khách hàng</h4>
            <p><strong>Khách hàng:</strong> ${selectedOrder.userFullName}</p>
            <p><strong>Email:</strong> ${selectedOrder.userEmail}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${selectedOrder.deliveryAddress}</p>
          </div>
          <div class="invoice-info-block">
            <h4>Thông tin thanh toán</h4>
            <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodText("PM001")}</p>
            <p><strong>Trạng thái đơn hàng:</strong> ${getStatusText(selectedOrder.status)}</p>
          </div>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th class="amount">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${selectedOrder.details
            .map(
                (detail, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><img src="${"/"+detail.productImage || '/placeholder.svg?height=50&width=50'}" alt="${detail.productName}" /></td>
                <td>${detail.productName}</td>
                <td>${formatCurrency(detail.unitPrice+detail.unitPrice/10)}</td>
                <td>${detail.quantity}</td>
                <td class="amount">${formatCurrency(detail.subtotal+detail.subtotal/10)}</td>
              </tr>
            `,
            )
            .join("")}
          </tbody>
        </table>
        <div class="invoice-total">
          <div class="invoice-total-row">
            <div class="label">Tổng tiền hàng:</div>
            <div class="value">${formatCurrency(selectedOrder.totalAmount+selectedOrder.totalAmount/10)}</div>
          </div>
          <div class="invoice-total-row">
            <div class="label">Phí vận chuyển:</div>
            <div class="value">${formatCurrency(30000)}</div>
          </div>
          <div class="invoice-total-row final">
            <div class="label">Tổng thanh toán:</div>
            <div class="value">${formatCurrency(selectedOrder.totalAmount+selectedOrder.totalAmount/10+30000)}</div>
          </div>
        </div>
        <div class="invoice-footer">
          <p>Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!</p>
          <p>Mọi thắc mắc xin vui lòng liên hệ: support@example.com | 0123456789</p>
        </div>
        <div class="no-print" style="margin-top:30px;text-align:center">
          <button onclick="window.print()" style="padding:10px 20px;background-color:#4338ca;color:white;border:none;border-radius:5px;cursor:pointer">In hóa đơn</button>
        </div>
      </body>
      </html>
    `
        printWindow.document.open()
        printWindow.document.write(invoiceHtml)
        printWindow.document.close()
        printWindow.onload = () => setTimeout(() => { printWindow.focus(); printWindow.print() }, 1000)
    }

    const handleRefresh = async () => {
        await fetchData()
    }

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Đang tải dữ liệu đơn hàng...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    if (error && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white text-red-800 p-8 rounded-xl shadow-lg max-w-md">
                    <div className="flex items-center mb-6">
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold ml-4">Đã xảy ra lỗi</h3>
                    </div>
                    <p className="mb-6 text-gray-700">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center font-medium"
                    >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý đơn hàng</h1>
                        <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của khách hàng</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            <span>Làm mới</span>
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                        >
                            <Download className="h-4 w-4" />
                            <span>Xuất CSV</span>
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-md transition-all"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Bộ lọc</span>
                            {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div
                        className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${
                            selectedCard === "total" ? "ring-2 ring-indigo-500" : ""
                        }`}
                        onClick={() => handleSelectCard("total")}
                    >
                        <div className="p-5 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-green-600">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                <span>12% so với tháng trước</span>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${
                            selectedCard === "paymentSuccess" ? "ring-2 ring-indigo-500" : ""
                        }`}
                        onClick={() => handleSelectCard("paymentSuccess")}
                    >
                        <div className="p-5 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Thanh toán thành công</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.paymentSuccess}</p>
                                </div>
                                <div className="bg-emerald-100 p-3 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-emerald-600">
                                <span>Đã xác nhận thanh toán</span>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${
                            selectedCard === "revenue" ? "ring-2 ring-indigo-500" : ""
                        }`}
                        onClick={() => handleSelectCard("revenue")}
                    >
                        <div className="p-5 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Doanh thu</p>
                                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.revenue+stats.revenue/10)}</p>
                                </div>
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-green-600">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                <span>8% so với tháng trước</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isFilterOpen && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-indigo-100">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Tìm theo mã đơn, tên khách hàng, địa chỉ..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                {searchQuery && (
                                    <button
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày giao hàng
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="dateFilter"
                                    placeholder="Nhập ngày (DD/MM/YYYY)"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                {dateFilter && (
                                    <button
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                        onClick={() => setDateFilter("")}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                id="statusFilter"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="PAYMENT_SUCCESS">Thanh toán thành công</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                            <div className="border-b px-6 py-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {selectedCard
                                        ? `Danh sách đơn hàng - ${
                                            selectedCard === "total"
                                                ? "Tất cả"
                                                : selectedCard === "revenue" || selectedCard === "paymentSuccess"
                                                    ? "Thanh toán thành công"
                                                    : getStatusText(selectedCard)
                                        }`
                                        : "Danh sách đơn hàng"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Hiển thị {cardFilteredOrders.length} trong tổng số {orders.length} đơn hàng
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("totalAmount")}
                                        >
                                            <div className="flex items-center">
                                                Tổng tiền
                                                {sortConfig.key === "totalAmount" &&
                                                    (sortConfig.direction === "asc" ? (
                                                        <ChevronUp className="h-4 w-4 ml-1" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 ml-1" />
                                                    ))}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("deliveryDate")}
                                        >
                                            <div className="flex items-center">
                                                Ngày giao
                                                {sortConfig.key === "deliveryDate" &&
                                                    (sortConfig.direction === "asc" ? (
                                                        <ChevronUp className="h-4 w-4 ml-1" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 ml-1" />
                                                    ))}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedOrders.length > 0 ? (
                                        sortedOrders.map((order) => (
                                            <tr
                                                key={order._id}
                                                className={`hover:bg-indigo-50 cursor-pointer transition-colors ${
                                                    selectedOrder?._id === order._id ? "bg-indigo-50" : ""
                                                }`}
                                                onClick={() => handleSelectOrder(order)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                <span className="text-indigo-600 font-medium text-lg">
                                                                    {order.userFullName.charAt(0)}
                                                                </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{order.userFullName}</div>
                                                            <div className="text-xs text-gray-500">{order.userEmail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(order.totalAmount+order.totalAmount/10)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{order.details?.length || 0} sản phẩm</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                                order.status,
                                                            )}`}
                                                        >
                                                            {getStatusIcon(order.status)}
                                                            <span className="ml-1">{getStatusText(order.status)}</span>
                                                        </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <ShoppingBag className="h-10 w-10 text-gray-300 mb-2" />
                                                    <p className="font-medium text-gray-600 mb-1">Không tìm thấy đơn hàng nào</p>
                                                    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md h-full border border-gray-100">
                            <div className="border-b px-6 py-4">
                                <h2 className="text-xl font-semibold text-gray-800">Chi tiết đơn hàng</h2>
                            </div>
                            <div className="p-6">
                                {selectedOrder ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Đơn hàng #{selectedOrder._id}</h3>
                                                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdDate)}</p>
                                            </div>
                                            <div
                                                className={`px-3 py-1.5 rounded-lg ${getStatusBgColor(
                                                    selectedOrder.status,
                                                )} text-white font-medium text-sm flex items-center`}
                                            >
                                                {getStatusIcon(selectedOrder.status)}
                                                <span className="ml-1.5">{getStatusText(selectedOrder.status)}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-b py-4 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 p-2 rounded-lg">
                                                    <User className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700">Thông tin khách hàng</h4>
                                                    <p className="text-sm font-medium text-gray-900">{selectedOrder.userFullName}</p>
                                                    <p className="text-sm text-gray-500">{selectedOrder.userEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 p-2 rounded-lg">
                                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700">Địa chỉ giao hàng</h4>
                                                    <p className="text-sm text-gray-900">{selectedOrder.deliveryAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-indigo-100 p-2 rounded-lg">
                                                    {getPaymentMethodIcon("PM001")}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700">Phương thức thanh toán</h4>
                                                    <p className="text-sm text-gray-900">{getPaymentMethodText("PM001")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                <Box className="h-4 w-4 mr-1.5 text-indigo-600" />
                                                Chi tiết sản phẩm
                                            </h4>
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                                {selectedOrder.details && selectedOrder.details.length > 0 ? (
                                                    selectedOrder.details.map((detail) => (
                                                        <div
                                                            key={detail.orderDetailId}
                                                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors"
                                                        >
                                                            <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {detail.productImage ? (
                                                                    <img
                                                                        src={"/"+detail.productImage}
                                                                        alt={detail.productName}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.onerror = null
                                                                            e.target.src = "/placeholder.svg?height=56&width=56"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="ml-3 flex-grow">
                                                                <p className="text-sm font-medium text-gray-900">{detail.productName}</p>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatCurrency(detail.unitPrice+detail.unitPrice/10)} x {detail.quantity}
                                                                    </p>
                                                                    <p className="text-sm font-medium text-indigo-600">
                                                                        {formatCurrency(detail.subtotal+detail.subtotal/10)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                        <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-500">Không có thông tin chi tiết sản phẩm</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-t pt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Tổng tiền sản phẩm:</span>
                                                <span className="text-sm font-medium">{formatCurrency(selectedOrder.totalAmount+selectedOrder.totalAmount/10)}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                                                <span className="text-sm font-medium">{formatCurrency(30000)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t border-gray-200">
                                                <span>Tổng cộng:</span>
                                                <span className="text-indigo-600">{formatCurrency(selectedOrder.totalAmount+selectedOrder.totalAmount/10+30000)}</span>
                                            </div>
                                            <div className="flex justify-center pt-4 mt-4 border-t border-gray-200">
                                                <button
                                                    onClick={handlePrintInvoice}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center"
                                                >
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    In hóa đơn
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <div className="bg-indigo-100 p-4 rounded-full mb-4">
                                            <Package className="h-10 w-10 text-indigo-600" />
                                        </div>
                                        <p className="text-lg font-medium mb-1 text-gray-700">Không có đơn hàng được chọn</p>
                                        <p className="text-sm text-center text-gray-500">
                                            Vui lòng chọn một đơn hàng từ danh sách để xem chi tiết
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}