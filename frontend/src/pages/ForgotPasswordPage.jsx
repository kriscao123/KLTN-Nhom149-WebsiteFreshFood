"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmailForm = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Email không được để trống";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không hợp lệ";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateResetForm = () => {
        const newErrors = {};
        if (!verificationCode.trim()) newErrors.verificationCode = "Mã xác nhận không được để trống";
        if (!newPassword) newErrors.newPassword = "Mật khẩu mới không được để trống";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
        }
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!validateEmailForm()) return;
        setIsLoading(true);
        setSuccessMessage("");
        setErrors({});
        try {
            const response = await api.post("/users/forgot-password", { email });
            setShowVerification(true);
            setSuccessMessage(response.data.message || "Mã xác nhận đã được gửi đến email của bạn");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.email || "Gửi yêu cầu thất bại";
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateResetForm()) return;
        setIsLoading(true);
        setSuccessMessage("");
        setErrors({});
        try {
            const response = await api.post("/users/reset-password", { email, code: verificationCode, newPassword });
            setSuccessMessage(response.data.message || "Đặt lại mật khẩu thành công");
            setEmail("");
            setVerificationCode("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.newPassword || "Đặt lại mật khẩu thất bại";
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 sm:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-6 relative">
                        <Link to="/login" className="absolute top-6 left-6 text-white hover:text-blue-200 transition-colors">
                            <ArrowLeft size={20} />
                            <span className="sr-only">Quay lại</span>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white">{showVerification ? "Đặt lại mật khẩu" : "Quên mật khẩu"}</h1>
                            <p className="text-blue-100 mt-2 text-sm">{showVerification ? "Nhập mã xác nhận và mật khẩu mới" : "Nhập email để nhận mã xác nhận"}</p>
                        </div>
                    </div>
                    <div className="p-8">
                        {(successMessage || errors.general) && (
                            <div className="mb-8 p-4 rounded-lg text-sm text-center">
                                {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded">{successMessage}</p>}
                                {errors.general && <p className="bg-red-100 text-red-700 p-3 rounded mt-3">{errors.general}</p>}
                            </div>
                        )}
                        <motion.div
                            key={showVerification ? "reset" : "email"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {!showVerification ? (
                                <form onSubmit={handleForgotPassword} className="space-y-8">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-3 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Gửi mã xác nhận"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-8">
                                    <div>
                                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-3">
                                            Mã xác nhận
                                        </label>
                                        <input
                                            id="verificationCode"
                                            name="verificationCode"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className={`block w-full px-3 py-3 border ${errors.verificationCode ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                            placeholder="Nhập mã xác nhận"
                                        />
                                        {errors.verificationCode && <p className="mt-3 text-sm text-red-600">{errors.verificationCode}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-3">
                                            Mật khẩu mới
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={`block w-full pl-10 pr-10 py-3 border ${errors.newPassword ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                                placeholder="••••••••"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.newPassword && <p className="mt-3 text-sm text-red-600">{errors.newPassword}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3">
                                            Xác nhận mật khẩu
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                                placeholder="••••••••"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.confirmPassword && <p className="mt-3 text-sm text-red-600">{errors.confirmPassword}</p>}
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Đặt lại mật khẩu"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                        <div className="mt-8 text-center">
                            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
                <p className="mt-6 text-center text-xs text-gray-500">© 2025 Home Craft. Tất cả các quyền được bảo lưu.</p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;