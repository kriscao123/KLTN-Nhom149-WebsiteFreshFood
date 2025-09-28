"use client"

import { useState, useEffect, useRef } from "react"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import { AlertTriangle, CheckCircle, X, Download } from "lucide-react"
import api from "../services/api.js"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const Statistical = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState(null)
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [users, setUsers] = useState([])

    // Time selection states for each chart
    const [revenueTime, setRevenueTime] = useState({ year: 2025 })
    const [statusTime, setStatusTime] = useState({ month: 4, year: 2025 }) // Month 4 is May (0-based)
    const [topProductsTime, setTopProductsTime] = useState({ month: 4, year: 2025 })
    const [topCustomersTime, setTopCustomersTime] = useState({ month: 4, year: 2025 })
    const [topRevenueProductsTime, setTopRevenueProductsTime] = useState({ month: 4, year: 2025 })

    // Refs for charts to export to PDF
    const revenueChartRef = useRef(null)
    const statusChartRef = useRef(null)
    const topProductsChartRef = useRef(null)
    const topCustomersChartRef = useRef(null)
    const topRevenueProductsChartRef = useRef(null)

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    // Fetch data
    const fetchData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Fetch orders (includes orderDetails)
            const orderResponse = await api.get("/orders")
            const orderData = Array.isArray(orderResponse.data) ? orderResponse.data : []
            console.log("Orders data:", orderData)
            setOrders(orderData)

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
            setProducts(productsData)

            // Fetch users
            const usersResponse = await api.get("/users")
            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : []
            console.log("Users data:", usersData)
            setUsers(usersData)
        } catch (err) {
            console.error("Error fetching data:", err)
            setError(
                err.response?.data?.message ||
                "Không thể tải dữ liệu thống kê. Vui lòng thử lại."
            )
            showNotification("error", "Không thể tải dữ liệu thống kê")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Export chart to PDF
    const exportChartToPDF = async (chartRef, title) => {
        const chartElement = chartRef.current
        if (!chartElement) return

        const canvas = await html2canvas(chartElement, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${title}.pdf`)
        showNotification("success", `Đã xuất ${title} thành công!`)
    }

    // Export all charts to a single PDF
    const exportAllChartsToPDF = async () => {
        const pdf = new jsPDF("p", "mm", "a4")
        const chartRefs = [
            { ref: revenueChartRef, title: "Doanh thu theo tháng" },
            { ref: statusChartRef, title: "Phân bố trạng thái đơn hàng" },
            { ref: topProductsChartRef, title: "Top 5 sản phẩm bán chạy" },
            { ref: topCustomersChartRef, title: "Top 5 khách hàng mua nhiều nhất" },
            { ref: topRevenueProductsChartRef, title: "Top 5 sản phẩm doanh thu cao nhất" },
        ]

        for (let i = 0; i < chartRefs.length; i++) {
            const { ref, title } = chartRefs[i]
            if (ref.current) {
                const canvas = await html2canvas(ref.current, { scale: 2 })
                const imgData = canvas.toDataURL("image/png")
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

                if (i > 0) pdf.addPage()
                pdf.text(title, 10, 10)
                pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight)
            }
        }

        pdf.save("Statistical_Charts.pdf")
        showNotification("success", "Đã xuất tất cả biểu đồ thành công!")
    }

    // Calculate revenue by year
    const salesChartData = {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        datasets: [
            {
                label: `Doanh thu (VND) ${revenueTime.year}`,
                data: orders
                    .filter((order) => {
                        const orderDate = new Date(order.deliveryDate)
                        return (
                            order.status === "PAYMENT_SUCCESS" &&
                            orderDate.getFullYear() === revenueTime.year
                        )
                    })
                    .reduce((acc, order) => {
                        const month = new Date(order.deliveryDate).getMonth()
                        acc[month] = (acc[month] || 0) + Number(order.totalAmount+order.totalAmount/10)
                        return acc
                    }, Array(12).fill(0)),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
            },
        ],
    }

    // Calculate order status distribution for selected month/year
    const orderStatusChartData = {
        labels: ["Thanh toán thành công", "Không xác định"],
        datasets: [
            {
                data: orders
                    .filter((order) => {
                        const orderDate = new Date(order.deliveryDate)
                        return (
                            orderDate.getMonth() === statusTime.month &&
                            orderDate.getFullYear() === statusTime.year
                        )
                    })
                    .reduce(
                        (acc, order) => {
                            switch (order.status) {
                                case "PAYMENT_SUCCESS":
                                    acc[0]++
                                    break
                                default:
                                    acc[1]++
                                    break
                            }
                            return acc
                        },
                        [0, 0]
                    ),
                backgroundColor: ["#34D399", "#F87171"],
                borderColor: ["#059669", "#DC2626"],
                borderWidth: 1,
            },
        ],
    }

    // Calculate top selling products for selected month/year
    const topSellingProducts = products
        .map((product) => {
            const totalSold = orders
                .filter((order) => {
                    const orderDate = new Date(order.deliveryDate)
                    return (
                        order.status === "PAYMENT_SUCCESS" &&
                        orderDate.getMonth() === topProductsTime.month &&
                        orderDate.getFullYear() === topProductsTime.year &&
                        order.orderDetails
                    )
                })
                .flatMap((order) => order.orderDetails || [])
                .filter((detail) => detail.productId === product.productId)
                .reduce((sum, detail) => sum + detail.quantity, 0)
            return {
                ...product,
                sold: totalSold,
            }
        })
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)

    const topProductsChartData = {
        labels: topSellingProducts.map((product) => product.productName || "Unknown"),
        datasets: [
            {
                label: `Số lượng bán (Tháng ${topProductsTime.month + 1}/${topProductsTime.year})`,
                data: topSellingProducts.map((product) => product.sold),
                backgroundColor: "rgba(16, 185, 129, 0.7)",
                borderColor: "rgb(16, 185, 129)",
                borderWidth: 1,
            },
        ],
    }

    // Calculate top 5 customers with most purchases for selected month/year
    const topCustomers = users
        .map((user) => {
            const purchaseCount = orders
                .filter((order) => {
                    const orderDate = new Date(order.deliveryDate)
                    return (
                        order.status === "PAYMENT_SUCCESS" &&
                        order.userId === user.email &&
                        orderDate.getMonth() === topCustomersTime.month &&
                        orderDate.getFullYear() === topCustomersTime.year
                    )
                })
                .length
            return {
                ...user,
                purchaseCount,
            }
        })
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 5)


    const filteredCustomers = topCustomers.filter((user) => user.role === "CUSTOMER")
    const topCustomersChartData = {
        labels: filteredCustomers.map((user) => user.username || "Unknown"),
        datasets: [
            {
                label: `Số lần mua (Tháng ${topCustomersTime.month + 1}/${topCustomersTime.year})`,
                data: filteredCustomers.map((user) => user.purchaseCount),
                backgroundColor: "rgba(255, 99, 132, 0.7)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 1,
            },
        ],
    }

    // Calculate top 5 products by revenue for selected month/year
    const topRevenueProducts = products
        .map((product) => {
            const totalRevenue = orders
                .filter((order) => {
                    const orderDate = new Date(order.deliveryDate)
                    return (
                        order.status === "PAYMENT_SUCCESS" &&
                        orderDate.getMonth() === topRevenueProductsTime.month &&
                        orderDate.getFullYear() === topRevenueProductsTime.year &&
                        order.orderDetails
                    )
                })
                .flatMap((order) => {
                    const details = order.orderDetails || []
                    return details
                        .filter((detail) => detail.productId === product.productId)
                        .map((detail) => detail.quantity * detail.unitPrice)
                })
                .reduce((sum, revenue) => sum + revenue, 0)
            return {
                ...product,
                revenue: totalRevenue,
            }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    const topRevenueProductsChartData = {
        labels: topRevenueProducts.map((product) => product.productName || "Unknown"),
        datasets: [
            {
                label: `Doanh thu (Tháng ${topRevenueProductsTime.month + 1}/${topRevenueProductsTime.year})`,
                data: topRevenueProducts.map((product) => product.revenue+product.revenue/10),
                backgroundColor: "rgba(147, 51, 234, 0.7)",
                borderColor: "rgb(147, 51, 234)",
                borderWidth: 1,
            },
        ],
    }

    // If loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
                <div className="flex flex-col items-center bg-white p-10 rounded-2xl shadow-2xl">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-xl font-semibold text-gray-800">Đang tải dữ liệu...</p>
                    <p className="text-sm text-gray-600 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    // If error
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-100 to-orange-100">
                <div className="bg-white text-red-800 p-8 rounded-2xl shadow-lg max-w-md">
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

    // Generate years and months for dropdowns
    const years = Array.from({ length: 5 }, (_, i) => 2025 - i) // 2021-2025
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: `Tháng ${i + 1}`,
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-50 p-5 rounded-xl shadow-2xl max-w-sm flex items-center justify-between animate-slide-in ${
                        notification.type === "success"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                >
                    <div className="flex items-center">
                        {notification.type === "success" ? (
                            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                        ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                        )}
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-4 text-gray-600 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-900">Thống kê</h1>
                    <button
                        onClick={exportAllChartsToPDF}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Xuất tất cả biểu đồ
                    </button>
                </div>

                {/* Charts Section */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-indigo-800">Doanh thu theo tháng</h2>
                            <select
                                value={revenueTime.year}
                                onChange={(e) => setRevenueTime({ year: Number(e.target.value) })}
                                className="px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-indigo-50 text-indigo-800"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        Năm {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="h-80 w-full" ref={revenueChartRef}>
                            <Bar
                                data={salesChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => formatCurrency(value),
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            labels: {
                                                font: { size: 14, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => exportChartToPDF(revenueChartRef, "Doanh_thu_theo_thang")}
                            className="mt-4 flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Xuất biểu đồ
                        </button>
                    </div>

                    {/* Order Status Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-purple-800">Phân bố trạng thái đơn hàng</h2>
                            <div className="flex gap-2">
                                <select
                                    value={statusTime.month}
                                    onChange={(e) => setStatusTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-purple-50 text-purple-800"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={statusTime.year}
                                    onChange={(e) => setStatusTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-purple-50 text-purple-800"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="h-80 w-full" ref={statusChartRef}>
                            <Pie
                                data={orderStatusChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "right",
                                            labels: {
                                                font: { size: 14, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => exportChartToPDF(statusChartRef, "Phan_bo_trang_thai_don_hang")}
                            className="mt-4 flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Xuất biểu đồ
                        </button>
                    </div>

                    {/* Top Customers Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-pink-800">Top 5 khách hàng mua nhiều nhất</h2>
                            <div className="flex gap-2">
                                <select
                                    value={topCustomersTime.month}
                                    onChange={(e) => setTopCustomersTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm bg-pink-50 text-pink-800"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={topCustomersTime.year}
                                    onChange={(e) => setTopCustomersTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm bg-pink-50 text-pink-800"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="h-80 w-full" ref={topCustomersChartRef}>
                            <Bar
                                data={topCustomersChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    indexAxis: "y",
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                        y: {
                                            ticks: {
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => exportChartToPDF(topCustomersChartRef, "Top_5_khach_hang_mua_nhieu_nhat")}
                            className="mt-4 flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-all"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Xuất biểu đồ
                        </button>
                    </div>

                    {/* Top Revenue Products Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-teal-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-teal-800">Top 5 sản phẩm doanh thu cao nhất</h2>
                            <div className="flex gap-2">
                                <select
                                    value={topRevenueProductsTime.month}
                                    onChange={(e) => setTopRevenueProductsTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-teal-50 text-teal-800"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={topRevenueProductsTime.year}
                                    onChange={(e) => setTopRevenueProductsTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-teal-50 text-teal-800"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="h-80 w-full" ref={topRevenueProductsChartRef}>
                            <Bar
                                data={topRevenueProductsChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    indexAxis: "y",
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => formatCurrency(value),
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                        y: {
                                            ticks: {
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => exportChartToPDF(topRevenueProductsChartRef, "Top_5_san_pham_doanh_thu_cao_nhat")}
                            className="mt-4 flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-all"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Xuất biểu đồ
                        </button>
                    </div>

                    {/* Top Selling Products Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-green-800">Top 5 sản phẩm bán chạy</h2>
                            <div className="flex gap-2">
                                <select
                                    value={topProductsTime.month}
                                    onChange={(e) => setTopProductsTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-green-50 text-green-800"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={topProductsTime.year}
                                    onChange={(e) => setTopProductsTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                                    className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-green-50 text-green-800"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="h-80 w-full" ref={topProductsChartRef}>
                            <Bar
                                data={topProductsChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    indexAxis: "y",
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1,
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                        y: {
                                            ticks: {
                                                font: { size: 12, family: "Inter" },
                                                color: "#4B5563",
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        </div>
                        <button
                            onClick={() => exportChartToPDF(topProductsChartRef, "Top_5_san_pham_ban_chay")}
                            className="mt-4 flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Xuất biểu đồ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Statistical