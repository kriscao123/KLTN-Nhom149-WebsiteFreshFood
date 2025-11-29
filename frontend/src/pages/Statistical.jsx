import { useState, useEffect, useRef, useMemo } from "react"
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
  const [statusTime, setStatusTime] = useState({ month: 4, year: 2025 }) // Month 4 = May (0-based)
  const [topProductsTime, setTopProductsTime] = useState({ month: 4, year: 2025 })
  const [topCustomersTime, setTopCustomersTime] = useState({ month: 4, year: 2025 })
  const [topRevenueProductsTime, setTopRevenueProductsTime] = useState({ month: 4, year: 2025 })

  // Refs for charts to export to PDF
  const revenueChartRef = useRef(null)
  const statusChartRef = useRef(null)
  const topProductsChartRef = useRef(null)
  const topCustomersChartRef = useRef(null)
  const topRevenueProductsChartRef = useRef(null)

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // --- ✅ NORMALIZE theo dữ liệu backend bạn đang log ---
  const normalizeOrder = (o) => {
    const id = o.orderId || o._id
    const customerId = o.userId || o.customerId
    const status = String(o.orderStatus || o.status || "UNKNOWN").toUpperCase()

    // ưu tiên deliveryDate/orderDate nếu có, fallback createdAt/updatedAt
    const dateStr = o.deliveryDate || o.orderDate || o.createdAt || o.updatedAt
    const totalAmount = Number(o.totalAmount ?? o.totalPrice ?? o.total ?? 0)

    const itemsRaw = Array.isArray(o.orderItems) ? o.orderItems : Array.isArray(o.orderDetails) ? o.orderDetails : []
    const items = itemsRaw.map((it) => ({
      productId: String(it.productId || it.product || it._id || ""),
      quantity: Number(it.quantity ?? it.qty ?? 0),
      unitPrice: Number(it.unitPrice ?? it.price ?? 0),
    }))

    return {
      id: String(id || ""),
      customerId: String(customerId || ""),
      status,
      dateStr,
      totalAmount,
      items,
    }
  }

  const getOrderDate = (o) => {
    const d = new Date(o?.dateStr)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // --- ORDERS ---
      const orderResponse = await api.get("/order")

      // backend có thể trả: array, hoặc {content: []}
      const rawOrders = Array.isArray(orderResponse.data)
        ? orderResponse.data
        : Array.isArray(orderResponse.data?.content)
          ? orderResponse.data.content
          : []

      const normalizedOrders = rawOrders.map(normalizeOrder)
      console.log("Orders normalized:", normalizedOrders)
      setOrders(normalizedOrders)

      // --- PRODUCTS ---
      const productsResponse = await api.get("/products")
      let productsData = productsResponse?.data
      if (!Array.isArray(productsData)) productsData = productsData?.content || []
      console.log("Products data:", productsData)
      setProducts(productsData)

      // --- USERS ---
      const usersResponse = await api.get("/users")
      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : []
      console.log("Users data:", usersData)
      setUsers(usersData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê. Vui lòng thử lại.")
      showNotification("error", "Không thể tải dữ liệu thống kê")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Map nhanh productId -> product
  const productById = useMemo(() => {
    const m = new Map()
    for (const p of products) {
      if (p?._id) m.set(String(p._id), p)
    }
    return m
  }, [products])

  // helper: tạo ảnh title tiếng Việt bằng canvas (tránh pdf.text lỗi font)
const makeTitleImage = (title) => {
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 140;
  const ctx = c.getContext("2d");

  // nền trắng
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);

  // chữ (Arial hỗ trợ tiếng Việt tốt)
  ctx.fillStyle = "#111827";
  ctx.font = "bold 64px Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 30, c.height / 2);

  return c.toDataURL("image/png");
};

const exportChartToPDF = async (chartRef, fileName, titleVi) => {
  const wrap = chartRef.current;
  const canvasEl = wrap?.canvas;
  if (!canvasEl) return;

  const chartImg = canvasEl.toDataURL("image/png", 1.0);
  const titleImg = makeTitleImage(titleVi);

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfW = pdf.internal.pageSize.getWidth();

  // Title (image) - không lỗi tiếng Việt
  pdf.addImage(titleImg, "PNG", 10, 10, pdfW - 20, 18);

  // Chart image
  const imgProps = pdf.getImageProperties(chartImg);
  const chartW = pdfW - 20;
  const chartH = (imgProps.height * chartW) / imgProps.width;

  pdf.addImage(chartImg, "PNG", 10, 32, chartW, chartH);
  pdf.save(`${fileName}.pdf`);
  showNotification("success", `Đã xuất ${titleVi} thành công!`);
};

const exportAllChartsToPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfW = pdf.internal.pageSize.getWidth();

  const chartRefs = [
    { ref: revenueChartRef, file: "Doanh_thu_theo_thang", title: "Doanh thu theo tháng" },
    { ref: statusChartRef, file: "Phan_bo_trang_thai_don_hang", title: "Phân bố trạng thái đơn hàng" },
    { ref: topProductsChartRef, file: "Top_5_san_pham_ban_chay", title: "Top 5 sản phẩm bán chạy" },
    { ref: topCustomersChartRef, file: "Top_5_khach_hang_mua_nhieu_nhat", title: "Top 5 khách hàng mua nhiều nhất" },
    { ref: topRevenueProductsChartRef, file: "Top_5_san_pham_doanh_thu_cao_nhat", title: "Top 5 sản phẩm doanh thu cao nhất" },
  ];

  for (let i = 0; i < chartRefs.length; i++) {
    const { ref, title } = chartRefs[i];
    const wrap = ref.current;
    const canvasEl = wrap?.canvas;
    if (!canvasEl) continue;

    if (i > 0) pdf.addPage();

    const chartImg = canvasEl.toDataURL("image/png", 1.0);
    const titleImg = makeTitleImage(title);

    // Title (image)
    pdf.addImage(titleImg, "PNG", 10, 10, pdfW - 20, 18);

    // Chart
    const imgProps = pdf.getImageProperties(chartImg);
    const chartW = pdfW - 20;
    const chartH = (imgProps.height * chartW) / imgProps.width;

    pdf.addImage(chartImg, "PNG", 10, 32, chartW, chartH);
  }

  pdf.save("Statistical_Charts.pdf");
  showNotification("success", "Đã xuất tất cả biểu đồ thành công!");
};



  // --- ✅ Status mapping theo backend của bạn ---
  const STATUS_LABEL = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  }

  // ✅ Revenue by month (theo năm)
  const salesChartData = useMemo(() => {
    const acc = Array(12).fill(0)

    orders.forEach((o) => {
      const d = getOrderDate(o)
      if (!d) return
      if (d.getFullYear() !== revenueTime.year) return
      // thường không tính doanh thu đơn hủy
      if (o.status === "CANCELLED") return

      const month = d.getMonth()
      // bạn đang cộng thêm 10% ở nơi khác, giữ giống logic đó:
      const totalWithFee = o.totalAmount + o.totalAmount / 10
      acc[month] += Number(totalWithFee || 0)
    })

    return {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
      datasets: [
        {
          label: `Doanh thu (VND) ${revenueTime.year}`,
          data: acc,
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    }
  }, [orders, revenueTime.year])

  // ✅ Order status distribution (theo tháng/năm)
  const orderStatusChartData = useMemo(() => {
    const labels = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy", "Khác"]
    const acc = [0, 0, 0, 0, 0, 0]

    orders.forEach((o) => {
      const d = getOrderDate(o)
      if (!d) return
      if (d.getFullYear() !== statusTime.year) return
      if (d.getMonth() !== statusTime.month) return

      switch (o.status) {
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
        case "CANCELLED":
          acc[4]++
          break
        default:
          acc[5]++
          break
      }
    })

    return {
      labels,
      datasets: [
        {
          data: acc,
          backgroundColor: ["#F59E0B", "#3B82F6", "#A855F7", "#10B981", "#EF4444", "#9CA3AF"],
          borderColor: ["#D97706", "#2563EB", "#7C3AED", "#059669", "#DC2626", "#6B7280"],
          borderWidth: 1,
        },
      ],
    }
  }, [orders, statusTime.month, statusTime.year])

  // ✅ Top selling products (theo tháng/năm)
  const topSellingProducts = useMemo(() => {
    const soldMap = new Map()

    orders.forEach((o) => {
      const d = getOrderDate(o)
      if (!d) return
      if (d.getFullYear() !== topProductsTime.year) return
      if (d.getMonth() !== topProductsTime.month) return
      if (o.status === "CANCELLED") return

      o.items.forEach((it) => {
        const pid = String(it.productId || "")
        if (!pid) return
        soldMap.set(pid, (soldMap.get(pid) || 0) + Number(it.quantity || 0))
      })
    })

    return products
      .map((p) => {
        const pid = String(p._id || "")
        return { ...p, sold: soldMap.get(pid) || 0 }
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
  }, [orders, products, topProductsTime.month, topProductsTime.year])

  const topProductsChartData = useMemo(() => {
    return {
      labels: topSellingProducts.map((p) => p.productName || "Unknown"),
      datasets: [
        {
          label: `Số lượng bán (Tháng ${topProductsTime.month + 1}/${topProductsTime.year})`,
          data: topSellingProducts.map((p) => p.sold || 0),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 1,
        },
      ],
    }
  }, [topSellingProducts, topProductsTime.month, topProductsTime.year])

  // ✅ Top customers (đếm số đơn theo customerId)
  const topCustomersChartData = useMemo(() => {
    const countByCustomerId = new Map()

    orders.forEach((o) => {
      const d = getOrderDate(o)
      if (!d) return
      if (d.getFullYear() !== topCustomersTime.year) return
      if (d.getMonth() !== topCustomersTime.month) return
      if (o.status === "CANCELLED") return

      const cid = String(o.customerId || "")
      if (!cid) return
      countByCustomerId.set(cid, (countByCustomerId.get(cid) || 0) + 1)
    })

    const customersOnly = users
      .filter((u) => String(u.role || "").toUpperCase() === "CUSTOMER") // log của bạn là "Customer"
      .map((u) => {
        const uid = String(u.userId || u._id || "")
        return {
          ...u,
          purchaseCount: countByCustomerId.get(uid) || 0,
        }
      })
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 5)

    return {
      labels: customersOnly.map((u) => u.username || "Unknown"),
      datasets: [
        {
          label: `Số lần mua (Tháng ${topCustomersTime.month + 1}/${topCustomersTime.year})`,
          data: customersOnly.map((u) => u.purchaseCount || 0),
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
      ],
    }
  }, [orders, users, topCustomersTime.month, topCustomersTime.year])

  // ✅ Top revenue products (quantity * unitPrice; fallback lấy giá từ product nếu orderItem không có unitPrice)
  const topRevenueProductsChartData = useMemo(() => {
    const revenueByProductId = new Map()

    orders.forEach((o) => {
      const d = getOrderDate(o)
      if (!d) return
      if (d.getFullYear() !== topRevenueProductsTime.year) return
      if (d.getMonth() !== topRevenueProductsTime.month) return
      if (o.status === "CANCELLED") return

      o.items.forEach((it) => {
        const pid = String(it.productId || "")
        if (!pid) return

        const p = productById.get(pid)
        const unit = Number(it.unitPrice || p?.unitPrice || p?.price || 0)
        const line = Number(it.quantity || 0) * unit

        revenueByProductId.set(pid, (revenueByProductId.get(pid) || 0) + line)
      })
    })

    const top = products
      .map((p) => {
        const pid = String(p._id || "")
        return { ...p, revenue: revenueByProductId.get(pid) || 0 }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      labels: top.map((p) => p.productName || "Unknown"),
      datasets: [
        {
          label: `Doanh thu (Tháng ${topRevenueProductsTime.month + 1}/${topRevenueProductsTime.year})`,
          data: top.map((p) => (p.revenue || 0) + (p.revenue || 0) / 10), // giữ logic +10%
          backgroundColor: "rgba(147, 51, 234, 0.7)",
          borderColor: "rgb(147, 51, 234)",
          borderWidth: 1,
        },
      ],
    }
  }, [orders, products, productById, topRevenueProductsTime.month, topRevenueProductsTime.year])

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

  const years = Array.from({ length: 5 }, (_, i) => 2025 - i)
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: `Tháng ${i + 1}` }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
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

        <div className="grid gap-8 md:grid-cols-2">
          {/* Revenue */}
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
            <div className="h-80 w-full">
              <Bar
                ref={revenueChartRef}
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
                  plugins: { legend: { display: true } },
                }}
              />
            </div>
            <button
              onClick={() => exportChartToPDF(revenueChartRef, "Doanh_thu_theo_thang","Doanh thu theo tháng")}
              className="mt-4 flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Xuất biểu đồ
            </button>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-purple-800">Phân bố trạng thái đơn hàng</h2>
              <div className="flex gap-2">
                <select
                  value={statusTime.month}
                  onChange={(e) => setStatusTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                  className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-purple-50 text-purple-800"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={statusTime.year}
                  onChange={(e) => setStatusTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-purple-50 text-purple-800"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full">
              <Pie ref={statusChartRef} data={orderStatusChartData} options={{ maintainAspectRatio: false }} />
            </div>
            <button
              onClick={() => exportChartToPDF(statusChartRef, "Phan_bo_trang_thai_don_hang","Phân bố trạng thái đơn hàng")}
              className="mt-4 flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Xuất biểu đồ
            </button>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-pink-800">Top 5 khách hàng mua nhiều nhất</h2>
              <div className="flex gap-2">
                <select
                  value={topCustomersTime.month}
                  onChange={(e) => setTopCustomersTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                  className="px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm bg-pink-50 text-pink-800"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={topCustomersTime.year}
                  onChange={(e) => setTopCustomersTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  className="px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm bg-pink-50 text-pink-800"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full" >
              <Bar
                ref={topCustomersChartRef}
                data={topCustomersChartData}
                options={{
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <button
              onClick={() => exportChartToPDF(topCustomersChartRef, "Top_5_khach_hang_mua_nhieu_nhat","Top 5 khách hàng mua nhiều nhất")}
              className="mt-4 flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Xuất biểu đồ
            </button>
          </div>

          {/* Top revenue products */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-teal-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-teal-800">Top 5 sản phẩm doanh thu cao nhất</h2>
              <div className="flex gap-2">
                <select
                  value={topRevenueProductsTime.month}
                  onChange={(e) => setTopRevenueProductsTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                  className="px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-teal-50 text-teal-800"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={topRevenueProductsTime.year}
                  onChange={(e) => setTopRevenueProductsTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  className="px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-teal-50 text-teal-800"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full">
              <Bar
                ref={topRevenueProductsChartRef}
                data={topRevenueProductsChartData}
                options={{
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  scales: { x: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <button
              onClick={() => exportChartToPDF(topRevenueProductsChartRef, "Top_5_san_pham_doanh_thu_cao_nhat","Top 5 sản phẩm doanh thu cao nhất")}
              className="mt-4 flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Xuất biểu đồ
            </button>
          </div>

          {/* Top selling products */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-800">Top 5 sản phẩm bán chạy</h2>
              <div className="flex gap-2">
                <select
                  value={topProductsTime.month}
                  onChange={(e) => setTopProductsTime((prev) => ({ ...prev, month: Number(e.target.value) }))}
                  className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-green-50 text-green-800"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={topProductsTime.year}
                  onChange={(e) => setTopProductsTime((prev) => ({ ...prev, year: Number(e.target.value) }))}
                  className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-green-50 text-green-800"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80 w-full" >
              <Bar
                ref={topProductsChartRef}
                data={topProductsChartData}
                options={{
                  maintainAspectRatio: false,
                  indexAxis: "y",
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <button
              onClick={() => exportChartToPDF(topProductsChartRef, "Top_5_san_pham_ban_chay","Top 5 sản phẩm bán chạy")}
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
