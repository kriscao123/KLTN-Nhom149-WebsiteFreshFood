"use client";

import { useState, useEffect } from "react";
import {
    Search,
    User,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle,
    AlertTriangle,
    Check,
    Mail,
    Key,
    Users,
} from "lucide-react";
import api from "../services/api.js";

export default function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const customersPerPage = 10;

    const formatPhoneNumber = (phone) => {
        console.log("Định dạng số điện thoại:", phone);
        if (!phone) return "N/A";
        let formatted = phone.replace(/^\+84/, "0");
        formatted = formatted.replace(/\D/g, "");
        console.log("Số điện thoại đã định dạng:", formatted);
        return formatted;
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/users");
            const usersData = Array.isArray(response.data) ? response.data : [];
            console.log("Dữ liệu API thô:", usersData);
            console.log("Các vai trò:", usersData.map(user => user.role || "Không có role"));
            const filteredCustomers = usersData.filter((user) => user.role === "CUSTOMER");
            console.log("Khách hàng đã lọc:", filteredCustomers);
            setCustomers(filteredCustomers);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu khách hàng:", err);
            setError(
                err.response?.data?.message ||
                "Không thể tải dữ liệu khách hàng. Vui lòng thử lại."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("Đang lấy dữ liệu khách hàng...");
        setSearchQuery(""); // Đặt lại searchQuery khi tải dữ liệu
        fetchCustomers();
    }, []);

    useEffect(() => {
        console.log("Trạng thái khách hàng đã cập nhật:", customers);
    }, [customers]);

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log("Khách hàng sau khi lọc tìm kiếm:", filteredCustomers);

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    console.log("Khách hàng hiện tại:", currentCustomers);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleCustomerUpdated = (updatedCustomer) => {
        setCustomers(
            customers
                .map((c) => (c.userId === updatedCustomer.userId ? updatedCustomer : c))
                .sort((a, b) => b.userId.localeCompare(a.userId))
        );
        setIsEditModalOpen(false);
        showNotification("success", "Khách hàng đã được cập nhật thành công");
    };

    const handleDeleteCustomer = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            try {
                await api.delete(`/users/${id}`);
                setCustomers(customers.filter((c) => c.userId !== id));
                showNotification("success", "Khách hàng đã được xóa");
            } catch (err) {
                console.error("Lỗi khi xóa khách hàng:", err);
                showNotification("error", "Không thể xóa khách hàng. Vui lòng thử lại.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="flex flex-col items-center bg-white p-10 rounded-2xl shadow-2xl">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600"></div>
                    <p className="mt-6 text-xl font-semibold text-gray-800">Đang tải dữ liệu khách hàng...</p>
                    <p className="text-sm text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="bg-red-100 text-red-800 p-8 rounded-2xl shadow-lg max-w-md">
                    <div className="flex items-center mb-6">
                        <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                        <h3 className="text-xl font-semibold">Đã xảy ra lỗi</h3>
                    </div>
                    <p className="mb-5 text-sm">{error}</p>
                    <button
                        onClick={fetchCustomers}
                        className="px-6 py-3 bg-white border border-red-300 rounded-xl text-red-700 hover:bg-red-50 transition-all flex items-center justify-center"
                    >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
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

            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">
                    Quản lý khách hàng
                </h1>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Tìm kiếm khách hàng..."
                            className="pl-10 w-full md:w-72 border border-gray-200 rounded-xl py-3 px-4 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Tên khách hàng</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Số điện thoại</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Địa chỉ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {currentCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-6 text-center text-gray-600 font-medium">
                                    Không tìm thấy khách hàng nào
                                </td>
                            </tr>
                        ) : (
                            currentCustomers.map((customer) => {
                                console.log("Khách hàng đang hiển thị:", customer);
                                return (
                                    <tr key={customer.userId} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                                                    {customer.username?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {customer.username || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">{customer.email || "N/A"}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">{formatPhoneNumber(customer.phone) || "N/A"}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-800">
                                                    {customer.address || "N/A"}
                                                </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length > customersPerPage && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm text-gray-700 font-medium">
                            Hiển thị <span className="font-semibold">{indexOfFirstCustomer + 1}</span> đến{" "}
                            <span className="font-semibold">{Math.min(indexOfLastCustomer, filteredCustomers.length)}</span>{" "}
                            trong tổng số <span className="font-semibold">{filteredCustomers.length}</span> khách hàng
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}