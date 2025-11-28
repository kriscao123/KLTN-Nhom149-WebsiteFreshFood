"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getUserFromLocalStorage, clearUserFromLocalStorage } from "../assets/js/userData"
import debounce from "lodash/debounce"
import api from "../services/api.js"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [cartCount, setCartCount] = useState(0)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const loggedInUser = getUserFromLocalStorage()
        if (loggedInUser) {
            setUser(loggedInUser)
            setIsLoggedIn(true)
            fetchCartCount(loggedInUser.userId)
        } else {
            setUser(null)
            setIsLoggedIn(false)
            setCartCount(0)
        }
    }, [location.pathname])

    useEffect(() => {
        const handleCartUpdated = () => {
            const loggedInUser = getUserFromLocalStorage()
            if (loggedInUser) {
                // fetchCartCount(loggedInUser.email)
            }
        }

        window.addEventListener("cartUpdated", handleCartUpdated)
        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdated)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            const userMenu = document.querySelector(".user-menu")
            const userMenuButton = document.querySelector(".user-menu-button")

            if (
                userMenu &&
                userMenuButton &&
                !userMenu.contains(event.target) &&
                !userMenuButton.contains(event.target)
            ) {
                setIsUserMenuOpen(false)
            }
        }

        if (isUserMenuOpen) {
            document.addEventListener("click", handleClickOutside)
        }

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isUserMenuOpen])

    const fetchCartCount = async (userId) => {
    try {
        // Gọi API để lấy giỏ hàng của người dùng
        const response = await api.get(`/cart/user/${userId}`);
        
        // Kiểm tra dữ liệu giỏ hàng trả về
        if (response.data && response.data.cart) {
            const cartItems = response.data.cart.items || [];
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0); // Tính tổng số lượng sản phẩm trong giỏ hàng
            setCartCount(totalItems); // Cập nhật số lượng sản phẩm
        } else {
            setCartCount(0); // Nếu không có giỏ hàng
        }
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setCartCount(0); // Nếu có lỗi khi gọi API
    }
};

    const fetchSuggestions = useCallback(
        debounce(async (query) => {
            if (!query.trim()) {
                setSuggestions([])
                return
            }

            try {
                const response = await api.get(`/products/search?name=${encodeURIComponent(query)}&size=5`)
                const products = response.data?.content || []
                const filteredProducts = products.map((product) => ({
                    id: product.productId,
                    name: product.productName,
                    image: product.imageUrl,
                }))
                setSuggestions(filteredProducts)
            } catch (error) {
                console.error("Lỗi khi lấy gợi ý sản phẩm:", error)
                setSuggestions([])
            }
        }, 300),
        []
    )

    useEffect(() => {
        fetchSuggestions(searchText)
    }, [searchText, fetchSuggestions])

    const handleLogoutConfirm = () => {
        clearUserFromLocalStorage()
        setUser(null)
        setIsLoggedIn(false)
        setCartCount(0)
        setIsLogoutModalOpen(false)
        navigate("/login")
    }

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true)
    }

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchText.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchText)}`)
            setSearchText("")
            setSuggestions([])
        }
    }

    const handleSuggestionClick = (id) => {
        navigate(`/product/${id}`)
        setSearchText("")
        setSuggestions([])
    }

    return (
        <header className="sticky top-0 left-0 w-full glass z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-700">
            NH Food
          </Link>
        </div>
                {/* Search */}
                <div className="flex-1 max-w-xl relative">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="input pl-9"
                        />
                       <button type="submit" className="absolute right-1 top-1 h-8 px-3 btn-ghost rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-black"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </form>

                    {suggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-md max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion.id)}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                                >
                                    {suggestion.image && (
                                        <img
                                            src={suggestion.image || "/placeholder.svg"}
                                            alt={suggestion.name}
                                            className="w-8 h-8 mr-2 rounded object-cover"
                                        />
                                    )}
                                    <span className="truncate">{suggestion.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Navigation */}
                <div className="hidden md:flex items-center gap-6 ml-6">
                    <Link to="/" className="py-2 font-medium text-gray-700 hover:text-emerald-700">
                        Trang chủ
                    </Link>
                    <Link to="/products" className="py-2 font-medium text-gray-700 hover:text-emerald-700">
                        Sản phẩm
                    </Link>
                    <Link to="/contact" className="py-2 font-medium text-gray-700 hover:text-emerald-700">
                        Liên hệ
                    </Link>
                    <Link to="/about" className="py-2 font-medium text-gray-700 hover:text-emerald-700">
                        Giới thiệu
                    </Link>
                    {!isLoggedIn && (
                        <Link to="/login" className="py-2 font-medium text-gray-700 hover:text-emerald-700">
                            Đăng nhập
                        </Link>
                    )}
                    {isLoggedIn && user && (
                        <div className="relative">
                            <button
                                onClick={toggleUserMenu}
                                className="py-2 font-medium text-gray-700 hover:text-emerald-700 focus:outline-none user-menu-button"
                            >
                                {user.username}
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 user-menu">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Thông tin cá nhân
                                    </Link>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 focus:outline-none"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart */}
                <div className="ml-4">
                    <Link
                        to="/cart"
                        className="relative btn-ghost"
                    >
                        🛒
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 grid place-items-center">
                                {cartCount}
                            </span>
                        )}
                        <span className="ml-2">Giỏ hàng</span>
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden ml-4">
                    <button
                        className="btn-ghost h-10 w-10"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 py-2 shadow-sm">
                    <Link to="/" className="block px-4 py-2 text-gray-900 hover:bg-gray-100">
                        Trang chủ
                    </Link>
                    <Link to="/products" className="block px-4 py-2 text-gray-900 hover:bg-gray-100">
                        Sản phẩm
                    </Link>
                    <Link to="/contact" className="block px-4 py-2 text-gray-900 hover:bg-gray-100">
                        Liên hệ
                    </Link>
                    <Link to="/about" className="block px-4 py-2 text-gray-900 hover:bg-gray-100">
                        Giới thiệu
                    </Link>
                    {!isLoggedIn && (
                        <Link
                            to="/login"
                            className="block w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100"
                        >
                            Đăng nhập
                        </Link>
                    )}
                    {isLoggedIn && user && (
                        <div className="relative">
                            <button
                                onClick={toggleUserMenu}
                                className="block w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 focus:outline-none user-menu-button"
                            >
                                {user.username}
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-xl z-20 user-menu">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Thông tin cá nhân
                                    </Link>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 focus:outline-none"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed w-screen inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Xác nhận đăng xuất</h2>
                        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="btn-ghost focus:outline-none"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="btn-primary focus:outline-none"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header