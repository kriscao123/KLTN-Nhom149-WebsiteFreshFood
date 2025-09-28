
// CheckoutPage.jsx
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getUserFromLocalStorage } from "../assets/js/userData"
import { CheckCircle, AlertTriangle, X, ArrowLeft, ShoppingBag, ChevronDown } from "lucide-react"
import SepayQRCode from "../components/SepayQRCode"
import toast from "react-hot-toast"

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
    const [isLoading, setIsLoading] = useState(true)
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

    const user = getUserFromLocalStorage()
    const userId = user?.userId || null

    const navigate = useNavigate()
    const location = useLocation()
    const BASE_API_URL = process.env.REACT_APP_API_URL || "https://websitebandogiadung-dqzs.onrender.com"

    // Fetch cart items and products
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const params = new URLSearchParams(location.search)
                const itemIds = params.get("items")?.split(",") || []
                if (itemIds.length === 0) throw new Error("Không có sản phẩm nào được chọn")

                const cartResponse = await fetch(`${BASE_API_URL}/api/carts/user/${userId}`)
                if (!cartResponse.ok) throw new Error("Không thể tải giỏ hàng")
                const cartData = await cartResponse.json()
                const selectedItems = cartData.cartItems.filter(item => itemIds.includes(item.cartItemId))
                if (!selectedItems.length) throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng")
                setCartItems(selectedItems)

                const productResponse = await fetch(`${BASE_API_URL}/api/products?page=0&size=1000`)
                if (!productResponse.ok) throw new Error("Không thể tải sản phẩm")
                const productData = await productResponse.json()
                if (!productData.content?.length) throw new Error("Không có sản phẩm nào được tải")
                setProducts(productData.content)
            } catch (err) {
                console.error("Lỗi khi tải giỏ hàng:", err)
                setError(err.message || "Không thể tải thông tin thanh toán. Vui lòng thử lại.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [userId, location.search])

    // Tính toán tóm tắt đơn hàng
    const calculateSummary = () => {
        const subtotal = cartItems.reduce((sum, item) => {
            const product = products.find(p => p.productId === item.productId)
            const salePrice = product && typeof product.salePrice === "number" && product.salePrice > 0 ? product.salePrice : 0
            return sum + salePrice * item.quantity
        }, 0)
        const shipping = 1000 // Phí ship cố định 1k
        const total = subtotal + shipping
        return { subtotal, shipping, total }
    }

    // Hiển thị thông báo
    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    // Tạo mã đơn hàng
    const generateOrderId = async () => {
        return `THT${Date.now()}`
    }

    // Xử lý chọn địa chỉ
    const handleLocationSelect = () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !detailedAddress.trim()) {
            showNotification("error", "Vui lòng chọn đầy đủ thông tin địa chỉ giao hàng")
            return
        }

        const provinceName = vietnamLocations.provinces.find(p => p.id === selectedProvince)?.name || ""
        const districtName = vietnamLocations.districts[selectedProvince]?.find(d => d.id === selectedDistrict)?.name || ""
        const wardName = vietnamLocations.wards[selectedDistrict]?.find(w => w.id === selectedWard)?.name || ""
        const fullAddress = `${detailedAddress}, ${wardName}, ${districtName}, ${provinceName}`
        setDeliveryAddress(fullAddress)
        setIsLocationModalOpen(false)
    }

    // Xử lý thanh toán SEPay
    const handleSepayPayment = async () => {
        if (!deliveryAddress.trim()) {
            showNotification("error", "Vui lòng nhập địa chỉ giao hàng")
            return
        }
        if (!cartItems.length || !products.length) {
            showNotification("error", "Giỏ hàng trống hoặc không tải được sản phẩm")
            return
        }
        const { subtotal, total } = calculateSummary()
        if (subtotal <= 0) {
            showNotification("error", "Tổng tiền hàng phải lớn hơn 0")
            return
        }

        try {
            setIsSubmitting(true)
            let orderId

            const existingOrdersResponse = await fetch(`${BASE_API_URL}/api/orders?userId=${userId}`)
            if (!existingOrdersResponse.ok) {
                throw new Error("Không thể kiểm tra đơn hàng hiện có")
            }
            const existingOrders = await existingOrdersResponse.json()

            const matchingOrder = existingOrders.find(
                order => order.totalAmount === subtotal && ["PENDING", "PAYMENT_SUCCESS"].includes(order.status)
            )

            if (matchingOrder) {
                orderId = matchingOrder.orderId
            } else {
                const orderData = {
                    userId,
                    promotionId: null,
                    totalAmount: subtotal,
                    status: "PENDING",
                    deliveryAddress,
                    deliveryStatus: "PREPARING",
                    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    paymentMethodId: "PM004",
                    orderDetails: cartItems.map(item => {
                        const product = products.find(p => p.productId === item.productId) || { salePrice: 0 }
                        const unitPrice = typeof product.salePrice === "number" && product.salePrice > 0 ? product.salePrice : 0
                        if (unitPrice === 0) {
                            throw new Error(`Sản phẩm ${item.productId} có giá không hợp lệ`)
                        }
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice
                        }
                    })
                }

                console.log("Sending orderData:", JSON.stringify(orderData)) // Debug

                const orderResponse = await fetch(`${BASE_API_URL}/api/orders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData)
                })

                const contentType = orderResponse.headers.get("Content-Type")
                if (!orderResponse.ok) {
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await orderResponse.json()
                        throw new Error(errorData.message || "Không thể tạo đơn hàng")
                    } else {
                        const text = await orderResponse.text()
                        console.error("Phản hồi không phải JSON:", text)
                        throw new Error("Lỗi máy chủ, vui lòng thử lại sau")
                    }
                }

                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Dữ liệu trả về không đúng định dạng")
                }
                const order = await orderResponse.json()
                orderId = order.orderId
            }

            const payload = {
                orderId,
                amount: total,
                bankAccountNumber: process.env.REACT_APP_BANK_ACCOUNT || "0326829327",
                bankCode: process.env.REACT_APP_BANK_CODE || "MBBank",
                description: `Thanh toán đơn hàng ${orderId}`,

                customerEmail: user?.email || "user@example.com"
            }

            const response = await fetch(`${BASE_API_URL}/api/payments/sepay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const paymentContentType = response.headers.get("Content-Type")
            if (!response.ok) {
                if (paymentContentType && paymentContentType.includes("application/json")) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Không thể tạo giao dịch SEPay")
                } else {
                    const text = await response.text()
                    console.error("Phản hồi không phải JSON:", text)
                    throw new Error("Lỗi máy chủ, vui lòng thử lại sau")
                }
            }

            if (!paymentContentType || !paymentContentType.includes("application/json")) {
                throw new Error("Dữ liệu trả về không đúng định dạng")
            }
            const data = await response.json()

            setSepayPayment({
                paymentId: data.paymentId,
                qrCodeUrl: data.qrCodeUrl,
                amount: data.amount,
                transactionTimeout: data.transactionTimeout || 300
            })
            setIsSepayModalOpen(true)
        } catch (err) {
            console.error("Lỗi khi tạo giao dịch SEPay:", err)
            toast.error(err.message || "Không thể tạo giao dịch SEPay")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Xử lý khi thanh toán SEPay thành công
    const handleSepaySuccess = async () => {
        try {
            setIsSubmitting(true)

            const statusResponse = await fetch(`${BASE_API_URL}/api/payments/${sepayPayment.paymentId}`)
            if (!statusResponse.ok) {
                const statusContentType = statusResponse.headers.get("Content-Type")
                if (statusContentType && statusContentType.includes("application/json")) {
                    const errorData = await statusResponse.json()
                    throw new Error(errorData.message || "Không thể kiểm tra trạng thái thanh toán")
                } else {
                    const text = await statusResponse.text()
                    console.error("Phản hồi không phải JSON:", text)
                    throw new Error("Lỗi máy chủ khi kiểm tra trạng thái thanh toán")
                }
            }

            const paymentStatus = await statusResponse.json()
            if (paymentStatus.status !== "COMPLETED") {
                throw new Error("Thanh toán chưa được xác nhận")
            }

            for (const item of cartItems) {
                await fetch(`${BASE_API_URL}/api/carts/items`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, productId: item.productId })
                })
            }

            setOrderSuccess(sepayPayment.paymentId)
            setIsSepayModalOpen(false)
            toast.success("Đặt hàng thành công!")
            await showOrderDetails(sepayPayment.orderId)
        } catch (err) {
            console.error("Lỗi khi xử lý đơn hàng SEPay:", err)
            toast.error(err.message || "Không thể hoàn tất thanh toán. Vui lòng thử lại.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Xử lý đặt hàng (non-SEPay)
    const handleSubmitOrder = async () => {
        if (!deliveryAddress.trim()) {
            showNotification("error", "Vui lòng nhập địa chỉ giao hàng")
            return
        }
        if (!paymentMethod) {
            showNotification("error", "Vui lòng chọn phương thức thanh toán")
            return
        }
        if (!cartItems.length || !products.length) {
            showNotification("error", "Giỏ hàng trống hoặc không tải được sản phẩm")
            return
        }
        const { subtotal } = calculateSummary()
        if (subtotal <= 0) {
            showNotification("error", "Tổng tiền hàng phải lớn hơn 0")
            return
        }

        if (paymentMethod === "PM004") {
            await handleSepayPayment()
            return
        }

        try {
            setIsSubmitting(true)
            const orderId = await generateOrderId()

            const orderData = {
                userId,
                promotionId: null,
                totalAmount: subtotal,
                status: "PENDING",
                deliveryAddress,
                deliveryStatus: "PREPARING",
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                paymentMethodId: paymentMethod,
                orderDetails: cartItems.map(item => {
                    const product = products.find(p => p.productId === item.productId) || { salePrice: 0 }
                    const unitPrice = typeof product.salePrice === "number" && product.salePrice > 0 ? product.salePrice : 0
                    if (unitPrice === 0) {
                        throw new Error(`Sản phẩm ${item.productId} có giá không hợp lệ`)
                    }
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice
                    }
                })
            }

            console.log("Sending orderData:", JSON.stringify(orderData)) // Debug

            const orderResponse = await fetch(`${BASE_API_URL}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            })

            const contentType = orderResponse.headers.get("Content-Type")
            if (!orderResponse.ok) {
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await orderResponse.json()
                    throw new Error(errorData.message || "Không thể tạo đơn hàng")
                } else {
                    const text = await orderResponse.text()
                    console.error("Phản hồi không phải JSON:", text)
                    throw new Error("Lỗi máy chủ, vui lòng thử lại sau")
                }
            }

            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Dữ liệu trả về không đúng định dạng")
            }
            const order = await orderResponse.json()

            const statusResponse = await fetch(`${BASE_API_URL}/api/orders/${order.orderId}`)
            if (!statusResponse.ok) {
                const statusContentType = statusResponse.headers.get("Content-Type")
                if (statusContentType && statusContentType.includes("application/json")) {
                    const errorData = await statusResponse.json()
                    throw new Error(errorData.message || "Không thể kiểm tra trạng thái đơn hàng")
                } else {
                    const text = await statusResponse.text()
                    console.error("Phản hồi không phải JSON:", text)
                    throw new Error("Lỗi máy chủ khi kiểm tra trạng thái đơn hàng")
                }
            }

            const orderStatus = await statusResponse.json()
            if (orderStatus.status === "PENDING") {
                showNotification("info", "Đơn hàng đang chờ xác nhận thanh toán.")
            } else if (orderStatus.status !== "PAYMENT_SUCCESS" && paymentMethod !== "PM003") {
                throw new Error("Thanh toán chưa được xác nhận")
            }

            for (const item of cartItems) {
                await fetch(`${BASE_API_URL}/api/carts/items`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, productId: item.productId })
                })
            }

            setOrderSuccess(order.orderId)
            showNotification("success", "Đặt hàng thành công!")
            await showOrderDetails(order.orderId)
        } catch (err) {
            console.error("Lỗi khi đặt hàng:", err)
            showNotification("error", err.message || "Không thể đặt hàng. Vui lòng thử lại.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Hiển thị chi tiết đơn hàng
    const showOrderDetails = async (customOrderId = orderSuccess) => {
        if (!customOrderId || !user || !cartItems.length) return

        const formatCurrency = amount => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
        const formatDate = dateString => {
            const date = new Date(dateString)
            return date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
        }
        const getPaymentMethodText = methodId => {
            switch (methodId) {
                case "PM001": return "Thẻ VISA/MasterCard"
                case "PM002": return "MoMo"
                case "PM003": return "Thanh toán khi nhận hàng (COD)"
                case "PM004": return "SEPay QR"
                default: return "Không xác định"
            }
        }

        const orderDetailsResponse = await fetch(`${BASE_API_URL}/api/orders/${customOrderId}`)
        if (!orderDetailsResponse.ok) {
            toast.error("Không thể lấy chi tiết đơn hàng")
            return
        }
        const orderDetails = await orderDetailsResponse.json()

        const printWindow = window.open("", "_blank", "width=800,height=600")
        const invoiceHtml = `
<!DOCTYPE html>
<html lang="vi">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn #${customOrderId}</title>
<style>
    body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
    .invoice-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
}
    .invoice-header h1 {
    color: #4338ca;
    margin-bottom: 5px;
}
    .invoice-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
}
    .invoice-info-block {
    max-width: 50%;
}
    .invoice-info-block h4 {
    margin-bottom: 5px;
    color: #4338ca;
}
    .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}
    .invoice-table th {
    background-color: #f3f4f6;
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}
    .invoice-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
}
    .invoice-table .amount {
    text-align: right;
}
    .invoice-total {
    margin-top: 20px;
    text-align: right;
}
    .invoice-total-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 5px;
}
    .invoice-total-row .label {
    width: 150px;
    text-align: left;
}
    .invoice-total-row .value {
    width: 150px;
    text-align: right;
}
    .invoice-total-row.final {
    font-weight: bold;
    font-size: 1.2em;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    margin-top: 10px;
    color: #4338ca;
}
    .invoice-footer {
    margin-top: 50px;
    text-align: center;
    color: #666;
    font-size: 0.9em;
    border-top: 1px solid #ddd;
    padding-top: 20px;
}
    .close-btn {
    margin-top: 20px;
    text-align: center;
}
    .close-btn button {
    padding: 10px 20px;
    background-color: #4338ca;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
    .close-btn button:hover {
    background-color: #3730a3;
}
    @media print {
    .close-btn {
    display: none;
}
}
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
    ${cartItems
        .map((item, index) => {
            const product = products.find(p => p.productId === item.productId) || {
                productName: "Sản phẩm không tồn tại",
                salePrice: 0
            }
            const salePrice = typeof product.salePrice === "number" && product.salePrice > 0 ? product.salePrice : 0
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${product.productName}</td>
                <td>${formatCurrency(salePrice)}</td>
                <td>${item.quantity}</td>
                <td class="amount">${formatCurrency(salePrice * item.quantity)}</td>
              </tr>
            `
        })
        .join("")}
    </tbody>
</table>

<div class="invoice-total">
    <div class="invoice-total-row">
        <div class="label">Tổng tiền hàng:</div>
        <div class="value">${formatCurrency(calculateSummary().subtotal)}</div>
    </div>
    <div class="invoice-total-row">
        <div class="label">Phí vận chuyển:</div>
        <div class="value">${formatCurrency(calculateSummary().shipping)}</div>
    </div>
    <div class="invoice-total-row final">
        <div class="label">Tổng thanh toán:</div>
        <div class="value">${formatCurrency(calculateSummary().total)}</div>
    </div>
</div>

<div class="invoice-footer">
    <p>Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!</p>
    <p>Mọi thắc mắc xin vui lòng liên hệ: tranngochung19112004@gmail.com | 0393465113</p>
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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
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

                        {isSepayModalOpen && sepayPayment && (
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
                                        onSuccess={handleSepaySuccess}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
                            <div className="space-y-4">
                                {[
                                    { id: "PM001", name: "Thẻ VISA/MasterCard" },
                                    { id: "PM002", name: "MoMo" },
                                    { id: "PM003", name: "Thanh toán khi nhận hàng (COD)" },
                                    { id: "PM004", name: "SEPay QR" },
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
                                    const originalPrice = typeof product.originalPrice === "number" ? product.originalPrice : 0
                                    const salePrice = typeof product.salePrice === "number" ? product.salePrice : 0
                                    const isDiscounted = originalPrice > salePrice && originalPrice > 0
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
                                                            salePrice * item.quantity
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
                                onClick={handleSubmitOrder}
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
