"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Home, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        username:"",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        roleName: "Customer",
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Tên người dùng không được để trống";
        if (!formData.email.trim()) newErrors.email = "Email không được để trống";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
        if (!formData.password) newErrors.password = "Mật khẩu không được để trống";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        if (!formData.phone.trim()) newErrors.phone = "Số điện thoại không được để trống";
        else if (!/^\+84\d{9}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại phải bắt đầu bằng +84 và có 9 chữ số sau đó (ví dụ: +84326829327)";
        }
        if (!formData.address.trim()) newErrors.address = "Địa chỉ không được để trống";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhoneChange = (e) => {
        let phoneValue = e.target.value;
        if (phoneValue.startsWith("0")) {
            phoneValue = "+84" + phoneValue.slice(1);
        }
        setFormData({ ...formData, phone: phoneValue });
    };

    const handleSendOtp = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsLoading(true);
  try {
    // FE của bạn đang có field email & phone — chọn 1 trong 2
    const identifier = formData.email || formData.phone;
    if (!identifier) {
      setErrors({ email: "Nhập email hoặc số điện thoại để nhận OTP" });
      setIsLoading(false);
      return;
    }

    await api.post("/auth/request-otp", {
      identifier,          // BE tự nhận biết email/phone
      purpose: "register", // theo comment trong BE
    });

    setShowVerification(true); // hiển thị form nhập OTP
  } catch (err) {
    setErrors({ email: err.response?.data?.message || "Gửi OTP thất bại" });
  } finally {
    setIsLoading(false);
  }
};

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const identifier = formData.email || formData.phone; // chọn email hoặc phone tùy bạn
            await api.post("/auth/request-otp", {
            identifier,
            purpose: "register",
            });
            setShowVerification(true); // chuyển sang bước nhập OTP
        } catch (error) {
            setErrors({ general: error.response?.data?.message || "Gửi OTP thất bại" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
  e.preventDefault();
  if (!verificationCode.trim()) {
    setErrors({ verificationCode: "Mã xác nhận không được để trống" });
    return;
  }
  setIsLoading(true);
  setErrors({});

  try {
    const identifier = formData.email || formData.phone;
    const res = await api.post("/auth/verify-otp", {
      identifier,
      code: verificationCode,
    });
    const token = res.data?.otpToken;
    if (!token) {
      setErrors({ verificationCode: "Xác thực OTP không thành công" });
      return;
    }
    setOtpToken(token);

    // Bước cuối: tạo tài khoản
    await api.post("/auth/register", {
      otpToken: token,
      fullName: formData.fullName,
      password: formData.password,
      roleName: formData.roleName,
      username:formData.username  // KHÔNG dùng passwordHash
    });

    // Thành công → chuyển về login
    navigate("/login");
  } catch (error) {
    setErrors({ verificationCode: error.response?.data?.message || "Mã OTP không hợp lệ" });
  } finally {
    setIsLoading(false);
  }
};

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-6 relative">
                        <button
                            className="absolute top-6 left-6 text-white hover:text-blue-200 transition-colors"
                            onClick={() => navigate("/login")}
                        >
                            <ArrowLeft size={20} />
                            <span className="sr-only">Quay lại</span>
                        </button>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white">
                                {showVerification ? "Xác nhận mã" : "Đăng ký"}
                            </h1>
                            <p className="text-blue-100 mt-2">
                                {showVerification
                                    ? "Nhập mã xác nhận được gửi đến email của bạn"
                                    : "Tạo tài khoản để bắt đầu mua sắm"}
                            </p>
                        </div>
                    </div>
                    <div className="p-6">
                        {!showVerification ? (
                            <form onSubmit={handleRegister}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.fullName ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="Tên của bạn"
                                            />
                                        </div>
                                        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.email ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`block w-full pl-10 pr-10 py-2.5 border ${
                                                    errors.password ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="••••••••"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`block w-full pl-10 pr-10 py-2.5 border ${
                                                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="text"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.phone ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="+84326829327"
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Home size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="address"
                                                name="address"
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.address ? "border-red-500" : "border-gray-300"
                                                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                placeholder="123 Đường ABC, Quận 1"
                                            />
                                        </div>
                                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Đăng ký"
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {errors.general && <p className="mt-4 text-sm text-red-600 text-center">{errors.general}</p>}
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyCode}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mã xác nhận
                                        </label>
                                        <input
                                            id="verificationCode"
                                            name="verificationCode"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className={`block w-full px-3 py-2.5 border ${
                                                errors.verificationCode ? "border-red-500" : "border-gray-300"
                                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                            placeholder="Nhập mã xác nhận"
                                        />
                                        {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                isLoading ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Xác nhận"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                {showVerification ? (
                                    <>
                                        Đã có tài khoản?{" "}
                                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                            Đăng nhập
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        Đã có tài khoản?{" "}
                                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                            Đăng nhập ngay
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">© 2025 NH Food. Tất cả các quyền được bảo lưu.</p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;