import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    ChevronDown,
    CreditCard,
    DollarSign,
    Download,
    Layers,
    Package,
    Plus,
    ShoppingBag,
    ShoppingCart,
    Truck,
    Users,
    X,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    PackageCheck,
    PackageX,
    HelpCircle
} from "lucide-react"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import api from "../services/api.js"

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const HomePageAdmin = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState(null)
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [users, setUsers] = useState([])
    const [customers, setCustomers] = useState([])
    const [stats, setStats] = useState({ orders: 0, customers: 0, revenue: 0, transactions: 0 })
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(0) // Backend uses 0-based paging
    const [totalPages, setTotalPages] = useState(1)
    const ordersPerPage = 5

    // Get status text
    const getStatusText = (status) => {
        switch (String(status || "UNKNOW").toUpperCase()) {
            case "PENDING":
            return "Chờ xác nhận";
            case "CONFIRMED":
            return "Đã xác nhận";
            case "SHIPPING":
            return "Đang giao";
            case "DELIVERED":
            return "Đã giao";
            case "CANCELLED":
            return "Đã hủy";
            default:
            return "Không xác định";
        }
        };


    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (String(status || "UNKNOW").toUpperCase()) {
            case "PENDING":
            return "bg-amber-100 text-amber-800 border border-amber-200";
            case "CONFIRMED":
            return "bg-blue-100 text-blue-800 border border-blue-200";
            case "SHIPPING":
            return "bg-purple-100 text-purple-800 border border-purple-200";
            case "DELIVERED":
            return "bg-green-100 text-green-800 border border-green-200";
            case "CANCELLED":
            return "bg-rose-100 text-rose-800 border border-rose-200";
            default:
            return "bg-gray-100 text-gray-800 border border-gray-200";
        }
        };


    // Get status icon
    const getStatusIcon = (status) => {
        switch (String(status || "UNKNOW").toUpperCase()) {
            case "PENDING":
            return <Clock className="h-4 w-4" />;
            case "CONFIRMED":
            return <PackageCheck className="h-4 w-4" />;
            case "SHIPPING":
            return <Truck className="h-4 w-4" />;
            case "DELIVERED":
            return <Package className="h-4 w-4" />;
            case "CANCELLED":
            return <XCircle className="h-4 w-4" />;
            default:
            return <HelpCircle className="h-4 w-4" />;
        }
        };

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

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    
    const normalizeShipAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;

    const parts = [];
    const push = (v) => {
        if (v === undefined || v === null) return;
        const s = String(v).trim();
        if (s) parts.push(s);
    };

    push(addr.street);
    push(addr.ward);
    push(addr.district);
    push(addr.city);
    push(addr.province);
    push(addr.country);

    if (!parts.length) {
        Object.values(addr).forEach((v) => {
        if (typeof v === "string" || typeof v === "number") push(v);
        });
    }

    return parts.join(", ");
    };

    const normalizeOrdersForAdminUI = (rawOrders = []) => {
    return rawOrders.map((o) => ({
        orderId: o.orderId || o._id, 
        userId: o.userId || o.customerId, 
        deliveryAddress: o.deliveryAddress || normalizeShipAddress(o.shipAddress),
        deliveryDate: o.deliveryDate || o.orderDate,
        status: o.status || o.orderStatus, 
        totalAmount: o.totalAmount || 0,
        orderDetails:
        o.orderDetails ||
        (Array.isArray(o.orderItems)
            ? o.orderItems.map((it) => ({
                productId: it.productId,
                quantity: it.quantity || 0,
            }))
            : []),
    }));
};


    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                

                setIsLoading(true)

                // Fetch orders
                const orderResponse = await api.get(`/order?page=${currentPage}&size=${ordersPerPage}`)
                
                let orderData = []
                let totalPages = 1
                let revenue = 0
                let totalElements = 0

                // Check API response
                if (orderResponse.status === 200 && orderResponse.data) {
                    if (Array.isArray(orderResponse.data)) {
                        orderData = orderResponse.data;
                        totalPages = Math.ceil(orderData.length / ordersPerPage);
                        totalElements = orderData.length;
                    }

                    else if (Array.isArray(orderResponse.data.content)) {
                        orderData = orderResponse.data.content;
                        totalPages = orderResponse.data.totalPages || 1;
                        totalElements = orderResponse.data.totalElements || orderData.length;
                    }

                    else {
                        console.warn("Unexpected API format:", orderResponse.data);
                    }

                   const normalizedOrders = normalizeOrdersForAdminUI(orderData);

                    setOrders(normalizedOrders);
                    setTotalPages(totalPages);

                    // Calculate revenue from normalizedOrders
                    revenue = normalizedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                    } else {
                    console.warn("No valid order data, status:", orderResponse.status)
                    setOrders([])
                    setTotalPages(1)
                }

                // Fetch products
                const productResponse = await api.get(`/products?page=0&size=1000`)
                if (productResponse.status === 200 && productResponse.data) {
                    setProducts(productResponse.data)
                } else {
                    console.warn("No valid product data, status:", productResponse.status)
                    setProducts([])
                }

                // Fetch users
                const userResponse = await api.get(`/users`)
                if (userResponse.status === 200 && Array.isArray(userResponse.data)) {
                    setUsers(userResponse.data)
                    const nonAdminUsers = userResponse.data.filter(u => u.role.toUpperCase() !== "ADMIN")
                    setCustomers(nonAdminUsers)
                } else {
                    console.warn("No valid user data, status:", userResponse.status)
                    setUsers([])
                    setCustomers([])
                }

                // Calculate stats
                setStats({
                    orders: totalElements,
                    customers: customers.length,
                    revenue,
                    transactions: totalElements,
                })
            } catch (err) {
                console.error("Error fetching data:", err.message, err.response?.data)
                setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [currentPage, customers.length])

    // Handle search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(0) // Reset to first page when searching
    }

    // Filter orders based on search query
    const filteredOrders = orders.filter((order) => {
        const user = users.find((u) => u.userId === order.userId)
        return (
            order.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })

    // Calculate top selling products
    const topSellingProducts = products
        .map((product) => {
            const totalSold = orders
                .flatMap((order) => order.orderDetails || [])
                .filter((detail) => detail.productId === product._id)
                .reduce((sum, detail) => sum + detail.quantity, 0)
            return {
                ...product,
                sold: totalSold,
            }
        })
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4)

   
    const exportReport = () => {
        const SEP = ";";

        const esc = (v) => {
            const s = v === null || v === undefined ? "" : String(v);
            const cleaned = s.replace(/\r?\n/g, " ").replace(/"/g, '""');
            return `"${cleaned}"`;
        };

        const header = ["Mã đơn hàng", "Khách hàng", "Email", "Ngày đặt", "Tổng tiền (VND)", "Trạng thái"];

        const rows = orders.map((order) => {
            const user = users.find((u) => (u.userId || u._id) === order.userId);

            const customerName = user?.username || user?.name || "Unknown User";
            const email = user?.email || ""; 
            const date = formatDate(order.deliveryDate);
            const total = Number(order.totalAmount) || 0; 
            const status = getStatusText(order.status);

            return [order.orderId, customerName, email, date, total, status];
        });

        // Dòng "sep=;" giúp Excel dùng đúng delimiter, không tách theo dấu .
        const csvLines = [
            `sep=${SEP}`,
            header.map(esc).join(SEP),
            ...rows.map((r) => r.map(esc).join(SEP)),
        ];

        // BOM UTF-8 để không lỗi tiếng Việt
        const csv = "\ufeff" + csvLines.join("\r\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `orders_report_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };


    // Chart data
    const salesChartData = {
        labels: ["Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        datasets: [
            {
                label: "Doanh thu (VND)",
                data: orders
                    .reduce((acc, order) => {
                        const month = new Date(order.deliveryDate).getMonth();  
                        if (month >= 0 && month <= 11) { 
                            acc[month+1] = (acc[month+1] || 0) + (order.totalAmount + order.totalAmount / 10 || 0);
                        }
                        return acc;
                    }, Array(12).fill(0))  
                    .slice(6, 12), 
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
            },
        ],
    };


    const orderStatusChartData = {
        labels: ["Chờ xác nhận", "Chờ lấy hàng", "Chờ giao hàng", "Đã giao", "Trả hàng", "Đã hủy"],
        datasets: [
            {
                data: orders.reduce(
                    (acc, order) => {
                        switch (order.status.toUpperCase()) {
                            case "PENDING":
                                acc[0]++
                                break
                            case "CONFIRMED":
                                acc[1]++
                                break
                            case "SHIPPING":
                                acc[2]++
                                break
                            case "DELIVERED":
                                acc[3]++
                                break
                            case "returned":
                                acc[4]++
                                break
                            case "CANCELLED":
                                acc[5]++
                                break
                            default:
                                break
                        }
                        return acc
                    },
                    [0, 0, 0, 0, 0, 0]
                ),
                backgroundColor: ["#F59E0B", "#3B82F6", "#06B6D4", "#10B981", "#F97316", "#EF4444"],
                borderColor: ["#D97706", "#2563EB", "#0891B2", "#059669", "#EA580C", "#DC2626"],
                borderWidth: 1,
            },
        ],
    }

    // Get recent activities
    const recentActivities = [
        {
            icon: <Package className="h-4 w-4" />,
            title: "Sản phẩm mới được thêm",
            description: products[products.length - 1]?.productName || "Nồi cơm điện thông minh",
            time: "5 phút trước",
            color: "text-blue-600 bg-blue-100",
        },
        {
            icon: <ShoppingBag className="h-4 w-4" />,
            title: "Đơn hàng mới",
            description: `Từ khách hàng ${
                users.find((u) => u.email === orders[orders.length - 1]?.userId)?.username ||
                "Nguyễn Văn A"
            }`,
            time: "5 phút trước",
            color: "text-green-600 bg-green-100",
        },
        {
            icon: <Users className="h-4 w-4" />,
            title: "Khách hàng mới đăng ký",
            description: customers[customers.length - 1]?.username || "Trần Thị B",
            time: "7 phút trước",
            color: "text-purple-600 bg-purple-100",
        },
    ]

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
            <div className="flex items-center justify-center">
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                    <p className="font-medium">Lỗi</p>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl">
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
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportReport}
                        className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300"
                    >
                        <Download className="h-4 w-4" />
                        <span>Xuất báo cáo</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
                            <p className="text-3xl font-bold">{stats.orders}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Khách hàng</p>
                            <p className="text-3xl font-bold">{stats.customers}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                            <p className="text-3xl font-bold">{formatCurrency(stats.revenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Giao dịch</p>
                            <p className="text-3xl font-bold">{stats.transactions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Doanh số bán hàng</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
                                    activeTab === "overview" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Tổng quan
                            </button>
                            <button
                                onClick={() => setActiveTab("monthly")}
                                className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
                                    activeTab === "monthly" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Theo tháng
                            </button>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <Bar data={salesChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Trạng thái đơn hàng</h2>
                        <button className="rounded-md text-sm text-gray-500 hover:text-gray-700">
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="h-64 w-full">
                        <Pie data={orderStatusChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-6">
                <div className="rounded-lg border bg-white shadow-sm">
                    <div className="border-b px-4 py-3 sm:px-6">
                        <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
                    </div>
                    <div className="px-4 py-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Tìm kiếm đơn hàng..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Ngày đặt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Tổng tiền
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
                            {filteredOrders.map((order) => {
                                const customer = users.find((u) => u.userId === order.userId)
                                return (
                                    <tr key={order.orderId} className="hover:bg-gray-50">

                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {customer ? customer.username : "Unknown User"}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-500">{formatDate(order.deliveryDate)}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1">{getStatusText(order.status)}</span>
                                                </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <Link to={`/admin/orders`} className="text-blue-600 hover:text-blue-900">
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-medium">{filteredOrders.length}</span> trong tổng số{" "}
                                <span className="font-medium">{orders.length}</span> đơn hàng
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Tiếp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity and Top Products */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="rounded-lg border bg-white shadow-sm">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
                        </div>
                        <div className="divide-y">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 px-4 py-3">
                                    <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${activity.color}`}>
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.description}</p>
                                        <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t p-4">
                            <button className="w-full rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200">
                                Xem tất cả
                            </button>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="rounded-lg border bg-white shadow-sm">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
                        </div>
                        <div className="divide-y">
                            {topSellingProducts.map((product) => (
                                <div key={product._id} className="flex items-center gap-4 px-4 py-3">
                                    <img
                                        src={product.imageUrl || "/placeholder.svg"}
                                        alt={product.productName}
                                        className="h-12 w-12 rounded-md object-cover border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium">{product.productName}</p>
                                        <p className="text-xs text-gray-500">{product.categoryId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{formatCurrency(product.unitPrice)}</p>
                                        <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t p-4">
                            <Link
                                to="/admin/products"
                                className="inline-block w-full rounded-md bg-white px-3 py-1.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200"
                            >
                                Xem tất cả sản phẩm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePageAdmin