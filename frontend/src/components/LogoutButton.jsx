"use client"

import { useNavigate } from "react-router-dom"

const LogoutButton = ({ className = "" }) => {
    const navigate = useNavigate()

    const handleLogout = () => {
        // Xóa tất cả thông tin đăng nhập khỏi localStorage
        localStorage.removeItem("userRole")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userName")
        localStorage.removeItem("isLoggedIn")

        // Chuyển hướng về trang đăng nhập
        navigate("/login")
    }

    return (
        <button onClick={handleLogout} className={`text-gray-500 hover:text-gray-700 ${className}`}>
            Đăng xuất
        </button>
    )
}

export default LogoutButton
