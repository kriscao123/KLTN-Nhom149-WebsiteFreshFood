"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [isOpen, onClose])

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ tên không được để trống"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email không được để trống"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu không được để trống"
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
        }

        if (!agreeTerms) {
            newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản sử dụng"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            // Success handling would go here
            console.log("Registration attempt with:", formData)
            onClose()
            // Optionally switch to login modal
            if (onSwitchToLogin) {
                onSwitchToLogin()
            }
        }, 1500)
    }

    // Stop propagation to prevent closing when clicking inside the modal
    const handleModalClick = (e) => {
        e.stopPropagation()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={handleModalClick}
                    >
                        <div className="bg-white rounded-2xl border border-1 border-black shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-blue-600 p-6 relative">
                                <button
                                    className="absolute top-6 right-6 text-white hover:text-blue-200 transition-colors"
                                    onClick={onClose}
                                >
                                    <X size={20} />
                                    <span className="sr-only">Đóng</span>
                                </button>

                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-white">Đăng ký tài khoản</h1>
                                    <p className="text-blue-100 mt-2">Tạo tài khoản để mua sắm dễ dàng hơn</p>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        {/* Full Name field */}
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
                                                    autoComplete="name"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                        errors.fullName ? "border-red-500" : "border-gray-300"
                                                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>
                                            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                                        </div>

                                        {/* Email field */}
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
                                                    autoComplete="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                                                        errors.email ? "border-red-500" : "border-gray-300"
                                                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        </div>

                                        {/* Phone field */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Số điện thoại (tùy chọn)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="0912345678"
                                                />
                                            </div>
                                        </div>

                                        {/* Password field */}
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
                                                    autoComplete="new-password"
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
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

                                        {/* Confirm Password field */}
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
                                                    autoComplete="new-password"
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
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

                                        {/* Terms and conditions checkbox */}
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="terms"
                                                    name="terms"
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) => {
                                                        setAgreeTerms(e.target.checked)
                                                        if (e.target.checked && errors.agreeTerms) {
                                                            setErrors((prev) => ({ ...prev, agreeTerms: "" }))
                                                        }
                                                    }}
                                                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                                        errors.agreeTerms ? "border-red-500" : ""
                                                    }`}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="terms" className="font-medium text-gray-700">
                                                    Tôi đồng ý với{" "}
                                                    <a href="#" className="text-blue-600 hover:text-blue-500">
                                                        Điều khoản sử dụng
                                                    </a>{" "}
                                                    và{" "}
                                                    <a href="#" className="text-blue-600 hover:text-blue-500">
                                                        Chính sách bảo mật
                                                    </a>
                                                </label>
                                            </div>
                                        </div>
                                        {errors.agreeTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>}

                                        {/* Submit button */}
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
                                </form>

                                {/* Divider */}
                                <div className="mt-6 flex items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink mx-4 text-sm text-gray-400">hoặc đăng ký với</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                {/* Social registration */}
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                <path
                                                    fill="#4285F4"
                                                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                                                />
                                            </g>
                                        </svg>
                                        Google
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2 text-[#1877F2]"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                                        </svg>
                                        Facebook
                                    </button>
                                </div>

                                {/* Login link */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Đã có tài khoản?{" "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose()
                                                if (onSwitchToLogin) {
                                                    onSwitchToLogin()
                                                }
                                            }}
                                            className="font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            Đăng nhập
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default RegisterModal
