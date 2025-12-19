import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getUserFromLocalStorage } from "../assets/js/userData"
import { CheckCircle, AlertTriangle, X, ArrowLeft, ShoppingBag, ChevronDown } from "lucide-react"
import SepayQRCode from "../components/SepayQRCode"
import toast from "react-hot-toast"
import api from "../services/api"

// Dữ liệu địa phương Việt Nam
const vietnamLocations = {
  provinces: [
    { id: "01", name: "Hà Nội" },
    { id: "02", name: "TP. Hồ Chí Minh" },
    { id: "03", name: "Đà Nẵng" },
  ],
  districts: {
    "01": [
      { id: "001", name: "Quận Ba Đình" },
      { id: "002", name: "Quận Hoàn Kiếm" },
      { id: "003", name: "Quận Hai Bà Trưng" },
    ],
    "02": [
      { id: "004", name: "Quận 1" },
      { id: "005", name: "Quận 3" },
      { id: "006", name: "Quận 7" },
    ],
    "03": [
      { id: "007", name: "Quận Hải Châu" },
      { id: "008", name: "Quận Thanh Khê" },
      { id: "009", name: "Quận Sơn Trà" },
    ],
  },
  wards: {
    "001": [
      { id: "00001", name: "Phường Đội Cấn" },
      { id: "00002", name: "Phường Ngọc Hà" },
    ],
    "002": [
      { id: "00003", name: "Phường Hàng Bông" },
      { id: "00004", name: "Phường Cửa Đông" },
    ],
    "003": [
      { id: "00005", name: "Phường Bạch Đằng" },
      { id: "00006", name: "Phường Thanh Lương" },
    ],
    "004": [
      { id: "00007", name: "Phường Bến Nghé" },
      { id: "00008", name: "Phường Bến Thành" },
    ],
    "005": [
      { id: "00009", name: "Phường Lý Thái Tổ" },
      { id: "00010", name: "Phường Võ Thị Sáu" },
    ],
    "006": [
      { id: "00011", name: "Phường Tân Phú" },
      { id: "00012", name: "Phường Tân Thuận Đông" },
    ],
    "007": [
      { id: "00013", name: "Phường Thạch Thang" },
      { id: "00014", name: "Phường Hải Châu 1" },
    ],
    "008": [
      { id: "00015", name: "Phường Thanh Khê Đông" },
      { id: "00016", name: "Phường Xuân Hà" },
    ],
    "009": [
      { id: "00017", name: "Phường An Hải Bắc" },
      { id: "00018", name: "Phường Mân Thái" },
    ],
  },
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  const [detailedAddress, setDetailedAddress] = useState("")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isSepayModalOpen, setIsSepayModalOpen] = useState(false)
  const [sepayPayment, setSepayPayment] = useState(null)
  // const [qrCodeUrl, setQrCodeUrl] = useState(""); // URL của mã QR thanh toán

  const user = getUserFromLocalStorage()
  const userId = user?.userId || null

  // Feature flag: bật/tắt SEPay qua biến môi trường VITE_ENABLE_SEPAY ('true' để bật)
  const ENABLE_SEPAY = import.meta.env.VITE_ENABLE_SEPAY === "true"

  const navigate = useNavigate()
  const location = useLocation()

  // Fetch cart items và chuẩn hoá dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)

        // Lấy danh sách id từ URL (?items=...) — có thể là productId._id HOẶC cartItemId
        const params = new URLSearchParams(location.search)
        const rawIds = params.get("items")?.split(",").map(s => s.trim()).filter(Boolean) || []

        const cartRes = await api.get(`/cart/user/${userId}`)
        const apiItems = cartRes?.data?.cart?.items || []

        // Chuẩn hoá item → { cartItemId, productId, quantity, unitPrice }
        const normalizedItems = apiItems.map(it => {
          const p = it.productId
          const productId = typeof p === "string" ? p : p?._id
          const unitPrice =
            typeof it.price === "number" ? it.price
              : typeof p?.unitPrice === "number" ? p.unitPrice
              : typeof p?.listPrice === "number" ? p.listPrice
              : 0
          return {
            cartItemId: it._id,
            productId,
            quantity: it.quantity || 1,
            unitPrice
          }
        })

        // Chấp nhận lọc theo cartItemId hoặc productId
        const selected = rawIds.length
          ? normalizedItems.filter(it => rawIds.includes(String(it.cartItemId)) || rawIds.includes(String(it.productId)))
          : normalizedItems

        if (!selected.length) throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng")
        setCartItems(selected)

        // Tạo danh sách products từ cart (khỏi gọi /products)
        const productsFromCart = apiItems
          .map(it => {
            const p = it.productId
            if (!p || typeof p !== "object") return null
            return {
              productId: p._id,
              productName: p.productName || "Sản phẩm",
              salePrice:
                typeof p.unitPrice === "number" ? p.unitPrice
                  : typeof p.listPrice === "number" ? p.listPrice
                  : typeof it.price === "number" ? it.price
                  : 0,
              originalPrice:
                typeof p.listPrice === "number" ? p.listPrice
                  : typeof p.unitPrice === "number" ? p.unitPrice
                  : 0,
              imageUrl: p.imageUrl || "/placeholder.svg"
            }
          })
          .filter(Boolean)

        // unique theo productId
        const uniq = []
        const seen = new Set()
        for (const pr of productsFromCart) {
          if (!seen.has(pr.productId)) {
            uniq.push(pr)
            seen.add(pr.productId)
          }
        }
        setProducts(uniq)
      } catch (err) {
        console.error("Lỗi khi tải giỏ hàng:", err)
        setError(err?.response?.data?.message || err.message || "Không thể tải thông tin thanh toán. Vui lòng thử lại.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, location.search])

  // Tính toán tóm tắt đơn hàng
const calculateSummary = () => {
  let subtotal = 0;
  cartItems.forEach(item => {
    const product = products.find(p => p.productId === item.productId);
    if (!product || !product.salePrice) {
      console.warn("Sản phẩm không có giá hợp lệ:", product);
      return; // Bỏ qua sản phẩm không có giá
    }
    const salePrice = product.salePrice;
    const itemTotal = salePrice * item.quantity;

    // Kiểm tra giá trị hợp lệ của itemTotal
    if (isNaN(itemTotal) || itemTotal <= 0) {
      console.warn("Sản phẩm không có giá trị hợp lệ:", product, item);
      return; // Bỏ qua sản phẩm có giá trị không hợp lệ
    }
    subtotal += itemTotal;
  });

  const shipping = 30000; // Phí vận chuyển cố định 30k
  const total = subtotal + shipping;

  if (isNaN(total) || total <= 0) {
    console.error("Tổng đơn hàng không hợp lệ:", total);
    return { subtotal: 0, shipping, total: 0 };
  }

  return { subtotal, shipping, total };
};




  // Hiển thị thông báo
  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 30000)
  }

  // Xử lý chọn địa chỉ
  const handleLocationSelect = () => {
    const { provinceName, districtName, wardName } = getLocationNames()
  if (!selectedProvince || !selectedDistrict || !selectedWard || !detailedAddress.trim()) {
    showNotification("error", "Vui lòng chọn đầy đủ thông tin địa chỉ giao hàng")
    return
  }
  const fullAddress = `${detailedAddress}, ${wardName}, ${districtName}, ${provinceName}`
  setDeliveryAddress(fullAddress)
  setIsLocationModalOpen(false)
  }


  
  const handleSepaySuccess = async (payload) => {
    if (!ENABLE_SEPAY) return

    setIsSepayModalOpen(false)

    const paidOrderId = payload?.orderId || sepayPayment?.orderId || sepayPayment?.paymentId

    showNotification("success", "THANH TOÁN SEPAY THÀNH CÔNG! ĐƠN HÀNG CỦA BẠN ĐÃ ĐƯỢC GHI NHẬN.")

    // 4) CHUYỂN SANG MÀN HÌNH THÀNH CÔNG (GIỐNG COD)
    if (paidOrderId) {
      setOrderSuccess(paidOrderId)
    }

    // 5) DỌN STATE SEPAY (TRÁNH DỮ LIỆU CŨ)
    setSepayPayment(null)
  }


const handleCheckout = async () => {
   if (!userId) {
    showNotification("error", "Bạn cần đăng nhập để thanh toán")
    return
  }
  if (!cartItems.length || !products.length) {
    showNotification("error", "Giỏ hàng trống hoặc không tải được sản phẩm")
    return
  }
  const { total, subtotal } = calculateSummary()
  if (!total || total <= 0 || !subtotal) {
    showNotification("error", "Tổng đơn hàng không hợp lệ")
    return
  }

  // shipAddress phải là OBJECT theo JSON Schema của backend
  const shipAddress = buildShipAddress()
  if (!shipAddress.line1) {
    showNotification("error", "Vui lòng nhập địa chỉ chi tiết")
    return
  }

  // Tạo dữ liệu đơn hàng với `unitPrice` cho mỗi sản phẩm
  const orderData = {
    userId: user.userId,
    deliveryAddress: shipAddress,
    paymentMethod: paymentMethod,
    items: cartItems.map(item => {
      const product = products.find(p => p.productId === item.productId);
      if (!product) {
        console.warn("Sản phẩm không tìm thấy:", item);
        return null;
      }

      // Lấy giá sản phẩm để làm `unitPrice`
      const unitPrice = product.salePrice || product.listPrice;
      if (!unitPrice || isNaN(unitPrice)) {
        console.warn("Giá sản phẩm không hợp lệ:", product);
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,  // Gửi giá trị `unitPrice`
      };
    }).filter(item => item !== null), // Lọc bỏ các sản phẩm không hợp lệ
    totalAmount: total, // Tổng tiền đơn hàng
  };

  try {
    const response = await api.post('/cart/checkout', orderData);
    if (response.data?.order?._id) {
      console.log("Đặt hàng thành công, ID đơn hàng:", response.data.order);
    const createdOrder = response.data.order;

    // NẾU SEPAY → SINH QR NGAY, MỞ MODAL QR
    if (paymentMethod === "SePay") {
      const qrRes = await api.post("/sepay/generate-qr", { orderId: createdOrder._id });

      const qrUrl = qrRes?.data?.qrUrl;
      const amount = qrRes?.data?.amount;

      if (!qrUrl) {
        toast.error("Không nhận được qrUrl từ server");
        return;
      }

      setSepayPayment({
        paymentId: createdOrder._id,
        qrCodeUrl: qrUrl,
        amount: amount,
        transactionTimeout: 300,
        paymentCode: qrRes?.data?.paymentCode, // optional
    });

      setIsSepayModalOpen(true);
    } else {
      // COD / PHƯƠNG THỨC KHÁC
      setOrderSuccess(createdOrder);
      showNotification("success", "Đặt hàng thành công!");
    } 
  } }catch (error) {
    console.error('Lỗi khi thanh toán:', error);
    showNotification("error", error?.response?.data?.message || "Không thể thanh toán. Vui lòng thử lại.");
  }
};

const getLocationNames = () => {
  const provinceName = vietnamLocations.provinces.find(p => p.id === selectedProvince)?.name || ""
  const districtName = vietnamLocations.districts[selectedProvince]?.find(d => d.id === selectedDistrict)?.name || ""
  const wardName = vietnamLocations.wards[selectedDistrict]?.find(w => w.id === selectedWard)?.name || ""
  return { provinceName, districtName, wardName }
}

const buildShipAddress = () => {
  const { provinceName, districtName, wardName } = getLocationNames()
  // object đúng theo yêu cầu JSON Schema của backend
  return {
    line1: detailedAddress.trim(),
    ward: wardName,
    district: districtName,
    province: provinceName
  }
}

  // Hiển thị chi tiết đơn hàng (client-side)
  const showOrderDetails = async (customOrderId = orderSuccess) => {
    if (!customOrderId || !user || !cartItems.length) return

    const orderDetails = {
      deliveryAddress,
      paymentMethodId: paymentMethod || "COD",
      status: "PENDING"
    }

    const getPaymentMethodText = methodId => {
      switch (methodId) {
        case "CreditCard": return "Thẻ VISA/MasterCard"
        case "MoMo": return "MoMo"
        case "COD": return "Thanh toán khi nhận hàng (COD)"
        case "SEPay QR": return "SEPay QR"
        default: return "Không xác định"
      }
    }

    const printWindow = window.open("", "_blank", "width=800,height=600")
    const invoiceHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hóa đơn #${customOrderId}</title>
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
.invoice-total { margin-top: 20px; text-align: right; }
.invoice-total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; }
.invoice-total-row .label { width: 150px; text-align: left; }
.invoice-total-row .value { width: 150px; text-align: right; }
.invoice-total-row.final { font-weight: bold; font-size: 1.2em; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; color: #4338ca; }
.invoice-footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.9em; border-top: 1px solid #ddd; padding-top: 20px; }
.close-btn { margin-top: 20px; text-align: center; }
.close-btn button { padding: 10px 20px; background-color: #4338ca; color: white; border: none; border-radius: 5px; cursor: pointer; }
.close-btn button:hover { background-color: #3730a3; }
@media print { .close-btn { display: none; } }
</style>
</head>
<body>
<div class="invoice-header">
  <h1>HÓA ĐƠN BÁN HÀNG</h1>
  <p>Ngày đặt hàng: ${formatDate(new Date().toISOString().split("T")[0])}</p>
</div>

<div class="invoice-info">
  <div class="invoice-info-block">
    <h4>Thông tin khách hàng</h4>
    <p><strong>Khách hàng:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Địa chỉ giao hàng:</strong> ${orderDetails.deliveryAddress}</p>
  </div>
  <div class="invoice-info-block">
    <h4>Thông tin thanh toán</h4>
    <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodText(orderDetails.paymentMethodId)}</p>
    <p><strong>Trạng thái đơn hàng:</strong> ${orderDetails.status === "PENDING" ? "Chờ xác nhận" : "Đã xác nhận"}</p>
  </div>
</div>

<table class="invoice-table">
  <thead>
    <tr>
      <th>STT</th>
      <th>Sản phẩm</th>
      <th>Đơn giá</th>
      <th>Số lượng</th>
      <th class="amount">Thành tiền</th>
    </tr>
  </thead>
  <tbody>
  ${cartItems.map((item, index) => {
      const product = products.find(p => p.productId === item.productId) || { productName: "Sản phẩm không tồn tại", salePrice: 0 }
      const price = typeof item.unitPrice === "number" && item.unitPrice > 0 ? item.unitPrice : (product.salePrice || 0)
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${product.productName}</td>
          <td>${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}</td>
          <td>${item.quantity}</td>
          <td class="amount">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price * item.quantity)}</td>
        </tr>`
    }).join("")}
  </tbody>
</table>

<div class="invoice-total">
  <div class="invoice-total-row">
    <div class="label">Tổng tiền hàng:</div>
    <div class="value">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(calculateSummary().subtotal)}</div>
  </div>
  <div class="invoice-total-row">
    <div class="label">Phí vận chuyển:</div>
    <div class="value">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(calculateSummary().shipping)}</div>
  </div>
  <div class="invoice-total-row final">
    <div class="label">Tổng thanh toán:</div>
    <div class="value">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(calculateSummary().total)}</div>
  </div>
</div>

<div class="invoice-footer">
  <p>Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!</p>
  <p>Mọi thắc mắc xin vui lòng liên hệ: nhanhoa.cao@gmail.com | 0827319452</p>
</div>

<div class="close-btn">
  <button onclick="window.close()">Đóng</button>
</div>
</body>
</html>
`

    printWindow.document.open()
    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
  }

  // Render khi chưa đăng nhập
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <ShoppingBag size={64} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h1>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để tiến hành thanh toán</p>
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

  // Render trạng thái đang tải
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Render trạng thái lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertTriangle size={64} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Lỗi thanh toán</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/cart"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Render trạng thái đặt hàng thành công
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h1>
            <p className="text-gray-600 mb-2">Mã đơn hàng: {orderSuccess}</p>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm với chúng tôi!</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/products"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
              <button
                onClick={() => showOrderDetails()}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Xem chi tiết đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { subtotal, shipping, total } = calculateSummary()

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg max-w-md flex items-center justify-between ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : notification.type === "info"
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle size={20} className="text-green-500 mr-3" />
            ) : notification.type === "info" ? (
              <span className="text-blue-500 mr-3">ℹ️</span>
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

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                  <div
                    onClick={() => setIsLocationModalOpen(true)}
                    className="border border-gray-300 rounded-md shadow-sm py-2 px-3 cursor-pointer flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="text-gray-600">
                      {deliveryAddress || "Chọn tỉnh/thành, quận/huyện, phường/xã"}
                    </span>
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {isLocationModalOpen && (
              <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chọn địa chỉ giao hàng</h3>
                    <button onClick={() => setIsLocationModalOpen(false)}>
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                      <select
                        value={selectedProvince}
                        onChange={e => {
                          setSelectedProvince(e.target.value)
                          setSelectedDistrict("")
                          setSelectedWard("")
                        }}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {vietnamLocations.provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                      <select
                        value={selectedDistrict}
                        onChange={e => {
                          setSelectedDistrict(e.target.value)
                          setSelectedWard("")
                        }}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!selectedProvince}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {selectedProvince &&
                          vietnamLocations.districts[selectedProvince]?.map(district => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                      <select
                        value={selectedWard}
                        onChange={e => setSelectedWard(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!selectedDistrict}
                      >
                        <option value="">Chọn phường/xã</option>
                        {selectedDistrict &&
                          vietnamLocations.wards[selectedDistrict]?.map(ward => (
                            <option key={ward.id} value={ward.id}>
                              {ward.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        value={detailedAddress}
                        onChange={e => setDetailedAddress(e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Số 123, Đường Lê Lợi"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleLocationSelect}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}

            {ENABLE_SEPAY && isSepayModalOpen && sepayPayment && (
              <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Thanh toán qua SEPay</h3>
                    <button onClick={() => setIsSepayModalOpen(false)}>
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                  <SepayQRCode
                    paymentId={sepayPayment.paymentId}
                    qrCodeUrl={sepayPayment.qrCodeUrl}
                    amount={sepayPayment.amount}
                    transactionTimeout={sepayPayment.transactionTimeout}
                    onSuccess={(payload) => handleSepaySuccess(payload)}
                  />
                </div>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-4">
                {[
                  { id: "SePay", name: "Thanh toán với SePay" },
                  { id: "MoMo", name: "MoMo" },
                  { id: "COD", name: "Thanh toán khi nhận hàng (COD)" },
                ].map(method => (
                  <div key={method.id} className="flex items-center">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={method.id} className="ml-3 block text-sm text-gray-700">
                      {method.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sản phẩm ({cartItems.length})</h2>
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => {
                  const product = products.find(p => p.productId === item.productId) || {
                    productName: "Sản phẩm không tồn tại",
                    imageUrl: "/placeholder.svg",
                    originalPrice: 0,
                    salePrice: 0
                  }
                  const price = typeof item.unitPrice === "number" && item.unitPrice > 0 ? item.unitPrice : product.salePrice
                  const originalPrice = typeof product.originalPrice === "number" ? product.originalPrice : price
                  const isDiscounted = originalPrice > price && originalPrice > 0
                  return (
                    <div key={item.cartItemId} className="py-4 flex items-center">
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={product.imageUrl || "/placeholder.svg?height=64&width=64"}
                          alt={product.productName}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-medium text-gray-800">{product.productName}</h3>
                        <p className="mt-1 text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              price * item.quantity
                            )}
                          </p>
                          {isDiscounted && (
                            <p className="text-sm text-gray-500 line-through">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                originalPrice * item.quantity
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="text-gray-800 font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-800 font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(shipping)}
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
                disabled={isSubmitting}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận đặt hàng"
                )}
              </button>
              <div className="mt-4">
                <Link to="/cart" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
