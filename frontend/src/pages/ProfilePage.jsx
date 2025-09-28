"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { CheckCircle, AlertTriangle, X, Clock, Truck, Package, XCircle, Search } from "lucide-react";
import { getUserFromLocalStorage } from "../assets/js/userData";

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState("personal");
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [products, setProducts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        // Remove +84 and ensure leading 0
        let formatted = phone.replace(/^\+84/, '0');
        // Remove any non-digit characters (in case there are spaces or dashes)
        formatted = formatted.replace(/\D/g, '');
        return formatted;
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS": return "bg-amber-100 text-amber-800 border border-amber-200";
            case "CONFIRMED": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
            case "SHIPPING": return "bg-blue-100 text-blue-800 border border-blue-200";
            case "DELIVERED": return "bg-green-100 text-green-800 border border-green-200";
            case "CANCELLED": return "bg-rose-100 text-rose-800 border border-rose-200";
            default: return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS": return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "SHIPPING": return "Đang giao hàng";
            case "DELIVERED": return "Đã giao hàng";
            case "CANCELLED": return "Đã hủy";
            default: return "Không xác định";
        }
    };

    const getRole = (role) => {
        switch (role) {
            case "CUSTOMER": return "Khách hàng";
            case "ADMIN": return "Quản lý";
            default: return role;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PAYMENT_SUCCESS": return <Clock className="h-4 w-4" />;
            case "CONFIRMED": return <CheckCircle className="h-4 w-4" />;
            case "SHIPPING": return <Truck className="h-4 w-4" />;
            case "DELIVERED": return <Package className="h-4 w-4" />;
            case "CANCELLED": return <XCircle className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = getUserFromLocalStorage();
                if (!storedUser?.email) {
                    throw new Error("Vui lòng đăng nhập để xem thông tin cá nhân");
                }

                // Set user data
                setUser(storedUser);
                setUsername(storedUser.username);
                setEmail(storedUser.email);
                setPhone(storedUser.phone || "");
                setAddress(storedUser.address || "");

                // Fetch orders for the user
                const orderResponse = await api.get(`/orders/all/user/${storedUser.email}`);
                const ordersData = orderResponse.data || [];
                setOrders(ordersData);

                // Create a set of product IDs from order details
                const productIds = new Set();
                ordersData.forEach(order => {
                    if (order.orderDetails) {
                        order.orderDetails.forEach(detail => {
                            productIds.add(detail.productId);
                        });
                    }
                });

                // Map order details by order ID
                const detailsByOrder = ordersData.reduce((acc, order) => {
                    acc[order.orderId] = order.orderDetails || [];
                    return acc;
                }, {});
                setOrderDetails(detailsByOrder);

                // Fetch products for relevant product IDs
                const productPromises = Array.from(productIds).map(productId =>
                    api.get(`/products/${productId}`)
                );
                const productResponses = await Promise.all(productPromises);
                const productsData = productResponses
                    .map(response => response.data)
                    .filter(product => product !== null);

                const productsById = productsData.reduce((acc, product) => {
                    acc[product.productId] = product;
                    return acc;
                }, {});
                setProducts(productsById);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.response?.status === 404) {
                    setOrders([]);
                    setOrderDetails({});
                    setProducts({});
                } else {
                    setError(err.response?.data?.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdatePersonalInfo = async (e) => {
        e.preventDefault();
        if (!username.trim() || !email.trim()) {
            showNotification("error", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                username: user.username,
                email: user.email,
                password: user.password,
                phone: user.phone,
                address: user.address,
                role: user.role,
            };
            const response = await api.put(`/users/${user.userId}`, payload);
            const updatedUser = response.data;
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            showNotification("success", "Cập nhật thông tin cá nhân thành công");
        } catch (err) {
            console.error("Error updating personal info:", err);
            showNotification("error", err.response?.data?.message || "Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification("error", "Vui lòng điền đầy đủ các trường");
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification("error", "Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }
        if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
            showNotification("error", "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt");
            return;
        }

        try {
            setIsSubmitting(true);

            // Verify current password
            const verifyResponse = await api.post('/users/login', {
                email: user.email,
                password: currentPassword
            });

            if (!verifyResponse.data || verifyResponse.status !== 200) {
                throw new Error("Mật khẩu hiện tại không đúng");
            }

            // Proceed with password change
            const payload = {
                username: user.username,
                email: user.email,
                password: newPassword,
                phone: user.phone,
                address: user.address,
                role: user.role,
            };
            await api.put(`/users/${user.userId}`, payload);
            showNotification("success", "Đổi mật khẩu thành công");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Error changing password:", err);
            showNotification("error", err.response?.data?.message || err.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesOrder = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProduct = orderDetails[order.orderId]?.some(detail => {
            const product = products[detail.productId] || {};
            return product.productName?.toLowerCase().includes(searchQuery.toLowerCase());
        }) || false;

        return matchesOrder || matchesProduct;
    });

    const showOrderDetails = (order) => {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
        };

        const formatDate = (dateString) => {
            return dateString ? new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }) : "Chưa xác định";
        };

        const printWindow = window.open("", "_blank", "width=800,height=600");

        const invoiceHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn #${order.orderId}</title>
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
        .close-btn { margin-top: 20px text-align: center; }
        .close-btn button { padding: 10px 20px; background-color: #4338ca; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .close-btn button:hover { background-color: #3730a3; }
        @media print { .close-btn { display: none; } }
    </style>
</head>
<body>
    <div class="invoice-header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Ngày đặt hàng: ${formatDate(order.createdDate)}</p>
    </div>
    <div class="invoice-info">
        <div class="invoice-info-block">
            <h4>Thông tin khách hàng</h4>
            <p><strong>Khách hàng:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${order.deliveryAddress}</p>
        </div>
        <div class="invoice-info-block">
            <h4>Thông tin đơn hàng</h4>
            <p><strong>Trạng thái đơn hàng:</strong> ${getStatusText(order.status)}</p>
            <p><strong>Ngày giao hàng dự kiến:</strong> ${formatDate(order.deliveryDate)}</p>
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
            ${orderDetails[order.orderId]
            .map((detail, index) => {
                const product = products[detail.productId] || {};
                return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${product.productName || "Sản phẩm không xác định"}</td>
                            <td>${formatCurrency(detail.unitPrice+detail.unitPrice/10)}</td>
                            <td>${detail.quantity}</td>
                            <td class="amount">${formatCurrency(detail.subtotal+detail.subtotal/10)}</td>
                        </tr>
                    `;
            })
            .join("")}
        </tbody>
    </table>
    <div class="invoice-total">
        <div class="invoice-total-row">
            <div class="label">Tổng tiền hàng:</div>
            <div class="value">${formatCurrency(order.totalAmount+order.totalAmount/10)}</div>
        </div>
        <div class="invoice-total-row">
            <div class="label">Phí vận chuyển:</div>
            <div class="value">${formatCurrency(30000)}</div>
        </div>
        <div class="invoice-total-row final">
            <div class="label">Tổng thanh toán:</div>
            <div class="value">${formatCurrency(order.totalAmount+order.totalAmount/10+30000)}</div>
        </div>
    </div>
    <div class="invoice-footer">
        <p>Cảm ơn quý khách đã mua hàng tại cửa hàng chúng tôi!</p>
        <p>Mọi thắc mắc xin vui lòng liên hệ: support@homecraft.com | 0393465113</p>
    </div>
    <div class="close-btn">
        <button onclick="window.close()">Đóng</button>
    </div>
</body>
</html>
`;

        printWindow.document.open();
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-lg rounded-xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <AlertTriangle size={64} className="text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h1>
                        <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin cá nhân</p>
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Đang tải dữ liệu cá nhân...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-lg rounded-xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <AlertTriangle size={64} className="text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Tài khoản của bạn</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/4">
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <nav className="space-y-2">
                                {["personal", "orders", "password"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                                            activeTab === tab
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {tab === "personal" && "Thông tin cá nhân"}
                                        {tab === "orders" && "Lịch sử đơn hàng"}
                                        {tab === "password" && "Thay đổi mật khẩu"}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <div className="lg:w-3/4">
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            {activeTab === "personal" && (
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thông tin cá nhân</h2>
                                    <form onSubmit={handleUpdatePersonalInfo} className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block font-semibold text-gray-700">Tên người dùng</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Tên người dùng"
                                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                value={formatPhoneNumber(phone)}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Số điện thoại"
                                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700">Địa chỉ</label>
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Địa chỉ"
                                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700">Vai trò</label>
                                            <p className="mt-1 text-gray-600">{getRole(user.role)}</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Cập nhật thông tin"
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                            {activeTab === "orders" && (
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lịch sử đơn hàng</h2>
                                    <div className="mb-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Tìm kiếm theo địa chỉ, tên sản phẩm..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    {filteredOrders.length === 0 ? (
                                        <p className="text-gray-600">Không tìm thấy đơn hàng nào.</p>
                                    ) : (
                                        <div className="space-y-4 max-h-[750px] overflow-y-auto">
                                            {filteredOrders.map((order) => (
                                                <div key={order.orderId} className="border border-gray-500 rounded-lg p-4 bg-white shadow-lg hover:shadow-md transition-all">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center">
                                                            {getStatusIcon(order.status)}
                                                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => showOrderDetails(order)}
                                                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                                        >
                                                            Xem chi tiết
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-4">
                                                        <p className="text-sm text-gray-600 mb-2">Địa chỉ giao: {order.deliveryAddress}</p>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            Tổng tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount+order.totalAmount/10)}
                                                        </p>
                                                        <div className="mt-4">
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm:</h4>
                                                            {orderDetails[order.orderId]?.map((detail) => {
                                                                const product = products[detail.productId] || {};
                                                                return (
                                                                    <div key={detail.orderDetailId} className="flex items-center space-x-4 mb-2">
                                                                        <img
                                                                            src={product.imageUrl || "/placeholder.svg"}
                                                                            alt={product.productName || "Sản phẩm"}
                                                                            className="w-12 h-12 object-cover rounded"
                                                                        />
                                                                        <div>
                                                                            <p className="text-sm font-medium">{product.productName || "Sản phẩm không xác định"}</p>
                                                                            <p className="text-sm text-gray-600">
                                                                                Số lượng: {detail.quantity} x {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(detail.unitPrice+detail.unitPrice/10)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "password" && (
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thay đổi mật khẩu</h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        <div>
                                            <label htmlFor="currentPassword" className="block font-semibold text-gray-700">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className="block font-semibold text-gray-700">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block font-semibold text-gray-700">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Đổi mật khẩu"
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
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

export default ProfilePage;