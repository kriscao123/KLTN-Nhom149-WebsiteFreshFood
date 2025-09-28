import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { AlertTriangle } from 'lucide-react'
import MenuAdmin from "./MenuAdmin"
import { getUserFromLocalStorage, clearUserFromLocalStorage } from "../assets/js/userData"
import { Link } from "react-router-dom"

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // Toggle sidebar
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    // Handle logout
    const handleLogout = () => {
        clearUserFromLocalStorage()
        setUser(null)
        navigate("/login")
    }

    // Validate admin user
    useEffect(() => {
        const storedUser = getUserFromLocalStorage()
        if (!storedUser || storedUser.role !== "ADMIN") {
            setError("Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản quản lý.")
            navigate("/login")
            return
        }
        setUser(storedUser)
        setIsLoading(false)
    }, [navigate])

    // If loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If error or no admin user
    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <AlertTriangle size={64} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Lỗi</h1>
                    <p className="text-gray-600 mb-6">{error || "Không tìm thấy tài khoản quản lý."}</p>
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            {/* Sidebar Menu */}
            <MenuAdmin
                user={user}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}