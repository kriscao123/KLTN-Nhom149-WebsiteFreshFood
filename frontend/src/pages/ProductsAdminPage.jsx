"use client"

import { useState, useEffect, useRef } from "react"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    X,
    Upload,
    RefreshCw,
    Save,
    ImageIcon,
    Tag,
    DollarSign,
    Package,
    FileText,
    Layers,
    Check,
} from "lucide-react"
import api from "../services/api.js"

export default function ProductsAdminPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 10
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [notification, setNotification] = useState(null)

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const fetchCategories = async () => {
        try {
            const response = await api.get("/products/categories")
            setCategories(response.data)
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err)
            setError(err.response?.data?.message || "Không thể tải danh mục")
        }
    }

    const fetchProducts = async () => {
        try {
            setIsLoading(true)
            const response = await api.get(`/products?page=${currentPage - 1}&size=${productsPerPage}`)
            setProducts(response.data.content || [])
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err)
            setError(err.response?.data?.message || "Không thể tải dữ liệu sản phẩm")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [currentPage])

    const filteredProducts = products.filter(
        (product) =>
            product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.categoryId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    const handleAddProduct = () => {
        setIsAddModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setSelectedProduct(product)
        setIsUpdateModalOpen(true)
    }

    const handleProductAdded = (newProduct) => {
        setProducts([newProduct, ...products])
        showNotification("success", "Sản phẩm mới đã được thêm thành công")
    }

    const handleProductUpdated = (updatedProduct) => {
        setProducts(products.map((p) => (p.productId === updatedProduct.productId ? updatedProduct : p)))
        showNotification("success", "Sản phẩm đã được cập nhật thành công")
    }

    const handleToggleVisibility = async (id, currentShow) => {
        try {
            const product = products.find((p) => p.productId === id)
            if (!product) return

            const updatedData = { ...product, show: !currentShow }
            const response = await api.put(`/products/${id}`, updatedData)

            setProducts(products.map((p) => (p.productId === id ? response.data : p)))
            showNotification("success", `Sản phẩm đã được ${!currentShow ? "hiển thị" : "ẩn"}`)
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err)
            showNotification("error", err.response?.data?.message || "Không thể cập nhật trạng thái sản phẩm")
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    const getCategoryName = (categoryId) => {
        const category = categories.find((c) => c.categoryId === categoryId)
        return category ? category.categoryName : categoryId
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                    <p className="mt-6 text-lg font-medium text-gray-700">Đang tải dữ liệu sản phẩm...</p>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md">
                    <h3 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h3>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-white border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-md flex items-center justify-between ${
                        notification.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    <div className="flex items-center">
                        {notification.type === "success" ? (
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <X className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p>{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">Quản lý sản phẩm</h1>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="search"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="pl-8 w-full md:w-64 border border-gray-300 rounded-md py-2 px-3"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                Sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                Danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                Giá gốc
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                Giá bán
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                Tồn kho
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {currentProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    Không tìm thấy sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            currentProducts.map((product) => (
                                <tr key={product.productId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 border">
                                                <img
                                                    src={product.imageUrl || "/placeholder.svg?height=40&width=40"}
                                                    alt={product.productName}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder.svg?height=40&width=40"
                                                    }}
                                                />
                                            </div>
                                            <div className="font-medium text-sm">{product.productName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getCategoryName(product.categoryId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(product.salePrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {formatCurrency(product.originalPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.quantityInStock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-1 rounded-md text-blue-400 hover:text-blue-500 hover:bg-blue-50"
                                                title="Chỉnh sửa sản phẩm"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{indexOfFirstProduct + 1}</span> đến{" "}
                            <span className="font-medium">{Math.min(indexOfLastProduct, filteredProducts.length)}</span> trong tổng số{" "}
                            <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isAddModalOpen && (
                <AddProductModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddProduct={handleProductAdded}
                    categories={categories}
                    setCategories={setCategories}
                />
            )}

            {isUpdateModalOpen && (
                <UpdateProductModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    product={selectedProduct}
                    onUpdateProduct={handleProductUpdated}
                    categories={categories}
                    setCategories={setCategories}
                />
            )}
        </div>
    )
}

function AddProductModal({ isOpen, onClose, onAddProduct, categories, setCategories }) {
    const fileInputRef = useRef(null)

    const initialProduct = {
        productName: "",
        originalPrice: "",
        imageUrl: "",
        description: "",
        categoryId: "",
        quantityInStock: 0,
        show: true,
    }

    const [product, setProduct] = useState(initialProduct)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [imagePreviews, setImagePreviews] = useState([])
    const [currentStep, setCurrentStep] = useState(1)
    const [successMessage, setSuccessMessage] = useState("")
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [categoryError, setCategoryError] = useState(null)

    const handleRefresh = () => {
        setProduct(initialProduct)
        setImagePreviews([])
        setError(null)
        setCurrentStep(1)
        setShowNewCategoryInput(false)
        setNewCategoryName("")
        setCategoryError(null)
    }

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "uploadAnh")

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/disdu197t/image/upload", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error?.message || "Không thể tải ảnh lên Cloudinary")
            }
            return data.url
        } catch (err) {
            throw new Error(err.message || "Không thể tải ảnh lên Cloudinary")
        }
    }

    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target
        if (type === "file" && files && files.length > 0) {
            try {
                setLoading(true)
                const file = files[0]
                const cloudinaryUrl = await uploadImageToCloudinary(file)
                setProduct((prev) => ({
                    ...prev,
                    imageUrl: cloudinaryUrl,
                }))
                setImagePreviews([cloudinaryUrl])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        } else {
            setProduct((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }))
        }
    }

    const handleCreateCategory = async () => {
        setCategoryError(null)
        setLoading(true)

        try {
            if (!newCategoryName || newCategoryName.length < 2 || newCategoryName.length > 50) {
                throw new Error("Tên danh mục phải từ 2 đến 50 ký tự")
            }

            const categoryData = {
                categoryName: newCategoryName,
            }

            const response = await api.post("/products/categories", categoryData)
            setCategories((prev) => [...prev, response.data])
            setProduct((prev) => ({ ...prev, categoryId: response.data.categoryId }))
            setShowNewCategoryInput(false)
            setNewCategoryName("")
            setSuccessMessage("Danh mục mới đã được thêm thành công!")
            setTimeout(() => setSuccessMessage(""), 2000)
        } catch (err) {
            console.error("Lỗi khi tạo danh mục:", err)
            setCategoryError(err.response?.data?.message || err.message || "Không thể tạo danh mục")
        } finally {
            setLoading(false)
        }
    }

    const calculateSalePrice = (originalPrice) => {
        if (!originalPrice || isNaN(originalPrice)) return 0
        return Number.parseFloat(originalPrice) * 1.1
    }

    const handleSubmit = async () => {
        setError(null)
        setLoading(true)
        setSuccessMessage("")

        try {
            if (!product.productName || product.productName.length < 2 || product.productName.length > 100) {
                throw new Error("Tên sản phẩm phải từ 2 đến 100 ký tự")
            }
            if (!product.originalPrice || Number(product.originalPrice) <= 0) {
                throw new Error("Giá gốc phải lớn hơn 0")
            }
            if (!product.categoryId) {
                throw new Error("Vui lòng chọn danh mục")
            }
            if (Number(product.quantityInStock) < 0) {
                throw new Error("Số lượng tồn kho phải lớn hơn hoặc bằng 0")
            }
            if (product.description && product.description.length > 500) {
                throw new Error("Mô tả không được vượt quá 500 ký tự")
            }

            const salePrice = calculateSalePrice(product.originalPrice)
            if (salePrice <= Number(product.originalPrice)) {
                throw new Error("Giá bán (tính từ giá gốc + 10%) phải lớn hơn giá gốc")
            }

            const productData = {
                productName: product.productName,
                description: product.description || null,
                originalPrice: salePrice,
                salePrice: Number.parseFloat(product.originalPrice),
                quantityInStock: Number.parseInt(product.quantityInStock, 10),
                categoryId: product.categoryId,
                imageUrl: product.imageUrl || null,
            }

            const response = await api.post("/products", productData)

            setSuccessMessage("Sản phẩm đã được thêm thành công!")
            onAddProduct(response.data)
            setTimeout(onClose, 1500)
        } catch (err) {
            console.error("Error saving product:", err)
            setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra khi thêm sản phẩm")
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        try {
            if (currentStep === 1) {
                if (!product.productName || product.productName.length < 2 || product.productName.length > 100) {
                    throw new Error("Tên sản phẩm phải từ 2 đến 100 ký tự")
                }
                if (!product.originalPrice || Number(product.originalPrice) <= 0) {
                    throw new Error("Giá gốc phải lớn hơn 0")
                }
                if (!product.categoryId) {
                    throw new Error("Vui lòng chọn danh mục")
                }
                if (Number(product.quantityInStock) < 0) {
                    throw new Error("Số lượng tồn kho phải lớn hơn hoặc bằng 0")
                }
            }
            setError(null)
            setCurrentStep((prev) => prev + 1)
        } catch (err) {
            setError(err.message)
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1)
        setError(null)
    }

    const triggerFileInput = () => {
        fileInputRef.current.click()
    }

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
        }
    }, [imagePreviews])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                1
                            </div>
                            <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                2
                            </div>
                            <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                3
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {currentStep === 1 ? "Thông tin cơ bản" : currentStep === 2 ? "Mô tả & Hình ảnh" : "Xác nhận"}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="productName" className="flex items-center text-sm font-medium text-gray-700">
                                        <Tag className="w-4 h-4 mr-2 text-blue-600" />
                                        Tên sản phẩm <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        id="productName"
                                        placeholder="Nhập tên sản phẩm"
                                        value={product.productName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="categoryId" className="flex items-center text-sm font-medium text-gray-700">
                                        <Layers className="w-4 h-4 mr-2 text-blue-600" />
                                        Danh mục <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <select
                                            name="categoryId"
                                            id="categoryId"
                                            value={product.categoryId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((category) => (
                                                <option key={category.categoryId} value={category.categoryId}>
                                                    {category.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setShowNewCategoryInput(true)}
                                            className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center"
                                            title="Thêm danh mục mới"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {showNewCategoryInput && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nhập tên danh mục mới"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    onClick={handleCreateCategory}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                                    disabled={loading}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowNewCategoryInput(false)
                                                        setNewCategoryName("")
                                                        setCategoryError(null)
                                                    }}
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {categoryError && (
                                                <p className="mt-2 text-sm text-red-600">{categoryError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="originalPrice" className="flex items-center text-sm font-medium text-gray-700">
                                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                                        Giá gốc <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            id="originalPrice"
                                            placeholder="Nhập giá gốc"
                                            value={product.originalPrice}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <span className="absolute left-3 top-2 text-gray-500">₫</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="quantityInStock" className="flex items-center text-sm font-medium text-gray-700">
                                        <Package className="w-4 h-4 mr-2 text-blue-600" />
                                        Số lượng tồn <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantityInStock"
                                        id="quantityInStock"
                                        placeholder="Nhập số lượng tồn kho"
                                        value={product.quantityInStock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                    Mô tả sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                                    value={product.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Hình ảnh sản phẩm
                                </label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
                                        imagePreviews.length > 0 ? "border-blue-300" : "border-gray-300"
                                    }`}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        name="images"
                                        id="images"
                                        ref={fileInputRef}
                                        onChange={handleChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {imagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="max-h-32 mx-auto object-contain" />
                                                    {index === 0 && (
                                                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                            Ảnh chính
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            <p className="text-sm text-center text-gray-500">Nhấp để thay đổi hình ảnh</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <Upload className="w-12 h-12 mx-auto text-blue-500" />
                                            <p className="text-gray-700 font-medium">Kéo thả hoặc nhấp để tải lên</p>
                                            <p className="text-sm text-gray-500">PNG, JPG, GIF (tối đa 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Xác nhận thông tin sản phẩm</h3>
                            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Tên sản phẩm</p>
                                    <p className="font-medium">{product.productName || "Chưa có thông tin"}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Danh mục</p>
                                    <p className="font-medium">
                                        {categories.find((c) => c.categoryId === product.categoryId)?.categoryName || "Chưa chọn danh mục"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Giá gốc</p>
                                    <p className="font-medium text-blue-600">
                                        {product.originalPrice
                                            ? `${Number.parseFloat(product.originalPrice).toLocaleString("vi-VN")}₫`
                                            : "Chưa có thông tin"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Giá bán</p>
                                    <p className="font-medium text-blue-600">
                                        {product.originalPrice
                                            ? `${calculateSalePrice(product.originalPrice).toLocaleString("vi-VN")}₫`
                                            : "Chưa có thông tin"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Số lượng tồn</p>
                                    <p className="font-medium">{product.quantityInStock || "0"}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-sm text-gray-500">Mô tả</p>
                                    <p className="font-medium">{product.description || "Không có mô tả"}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-sm text-gray-500">Hình ảnh</p>
                                    {imagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {imagePreviews.map((preview, index) => (
                                                <img
                                                    key={index}
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-32 object-contain"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Chưa có hình ảnh</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                            <Check className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between items-center">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Quay lại
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Làm mới
                            </button>
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tiếp theo
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
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
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Lưu sản phẩm
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function UpdateProductModal({ isOpen, onClose, product, onUpdateProduct, categories, setCategories }) {
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        productId: "",
        productName: "",
        originalPrice: "",
        description: "",
        imageUrl: "",
        categoryId: "",
        quantityInStock: "",
        show: true,
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [imagePreviews, setImagePreviews] = useState([])
    const [currentStep, setCurrentStep] = useState(1)
    const [successMessage, setSuccessMessage] = useState("")
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [categoryError, setCategoryError] = useState(null)

    useEffect(() => {
        if (product) {
            setFormData({
                productId: product.productId || "",
                productName: product.productName || "",
                originalPrice: product.salePrice || "",
                description: product.description || "",
                imageUrl: product.imageUrl || "",
                categoryId: product.categoryId || "",
                quantityInStock: product.quantityInStock || "",
                show: product.show !== undefined ? product.show : true,
            })
            setImagePreviews(product.imageUrl ? [product.imageUrl] : [])
        }
    }, [product])

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "uploadAnh")

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/disdu197t/image/upload", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error?.message || "Không thể tải ảnh lên Cloudinary")
            }
            return data.url
        } catch (err) {
            throw new Error(err.message || "Không thể tải ảnh lên Cloudinary")
        }
    }

    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target
        if (type === "file" && files && files.length > 0) {
            try {
                setLoading(true)
                const file = files[0]
                const cloudinaryUrl = await uploadImageToCloudinary(file)
                setFormData((prev) => ({
                    ...prev,
                    imageUrl: cloudinaryUrl,
                }))
                setImagePreviews([cloudinaryUrl])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }))
        }
    }

    const handleCreateCategory = async () => {
        setCategoryError(null)
        setLoading(true)

        try {
            if (!newCategoryName || newCategoryName.length < 2 || newCategoryName.length > 50) {
                throw new Error("Tên danh mục phải từ 2 đến 50 ký tự")
            }

            const categoryData = {
                categoryName: newCategoryName,
            }

            const response = await api.post("/products/categories", categoryData)
            setCategories((prev) => [...prev, response.data])
            setFormData((prev) => ({ ...prev, categoryId: response.data.categoryId }))
            setShowNewCategoryInput(false)
            setNewCategoryName("")
            setSuccessMessage("Danh mục mới đã được thêm thành công!")
            setTimeout(() => setSuccessMessage(""), 2000)
        } catch (err) {
            console.error("Lỗi khi tạo danh mục:", err)
            setCategoryError(err.response?.data?.message || err.message || "Không thể tạo danh mục")
        } finally {
            setLoading(false)
        }
    }

    const calculateSalePrice = (originalPrice) => {
        if (!originalPrice || isNaN(originalPrice)) return 0
        return Number.parseFloat(originalPrice) * 1.1
    }

    const handleSubmit = async () => {
        setError(null)
        setLoading(true)
        setSuccessMessage("")

        try {
            if (!formData.productName || formData.productName.length < 2 || formData.productName.length > 100) {
                throw new Error("Tên sản phẩm phải từ 2 đến 100 ký tự")
            }
            if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
                throw new Error("Giá gốc phải lớn hơn 0")
            }
            if (!formData.categoryId) {
                throw new Error("Vui lòng chọn danh mục")
            }
            if (Number(formData.quantityInStock) < 0) {
                throw new Error("Số lượng tồn kho phải lớn hơn hoặc bằng 0")
            }
            if (formData.description && formData.description.length > 500) {
                throw new Error("Mô tả không được vượt quá 500 ký tự")
            }

            const salePrice = calculateSalePrice(formData.originalPrice)
            if (salePrice <= Number(formData.originalPrice)) {
                throw new Error("Giá bán (tính từ giá gốc + 10%) phải lớn hơn giá gốc")
            }

            const updatedData = {
                productName: formData.productName,
                description: formData.description || null,
                originalPrice: salePrice,
                salePrice: Number.parseFloat(formData.originalPrice),
                quantityInStock: Number.parseInt(formData.quantityInStock, 10),
                categoryId: formData.categoryId,
                imageUrl: formData.imageUrl || null,
            }

            const response = await api.put(`/products/${formData.productId}`, updatedData)

            setSuccessMessage("Sản phẩm đã được cập nhật thành công!")
            onUpdateProduct(response.data)
            setTimeout(onClose, 1500)
        } catch (err) {
            console.error("Error updating product:", err)
            setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra khi cập nhật sản phẩm")
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        try {
            if (currentStep === 1) {
                if (!formData.productName || formData.productName.length < 2 || formData.productName.length > 100) {
                    throw new Error("Tên sản phẩm phải từ 2 đến 100 ký tự")
                }
                if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
                    throw new Error("Giá gốc phải lớn hơn 0")
                }
                if (!formData.categoryId) {
                    throw new Error("Vui lòng chọn danh mục")
                }
                if (Number(formData.quantityInStock) < 0) {
                    throw new Error("Số lượng tồn kho phải lớn hơn hoặc bằng 0")
                }
            }
            setError(null)
            setCurrentStep((prev) => prev + 1)
        } catch (err) {
            setError(err.message)
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1)
        setError(null)
    }

    const triggerFileInput = () => {
        fileInputRef.current.click()
    }

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
        }
    }, [imagePreviews])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Cập nhật sản phẩm</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                1
                            </div>
                            <div className={`h-1 w-12 ${currentStep >= 2 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                2
                            </div>
                            <div className={`h-1 w-12 ${currentStep >= 3 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    currentStep >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                3
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {currentStep === 1 ? "Thông tin cơ bản" : currentStep === 2 ? "Mô tả & Hình ảnh" : "Xác nhận"}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="productName" className="flex items-center text-sm font-medium text-gray-700">
                                        <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                                        Tên sản phẩm <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        id="productName"
                                        placeholder="Nhập tên sản phẩm"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="categoryId" className="flex items-center text-sm font-medium text-gray-700">
                                        <Layers className="w-4 h-4 mr-2 text-indigo-600" />
                                        Danh mục <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <select
                                            name="categoryId"
                                            id="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((category) => (
                                                <option key={category.categoryId} value={category.categoryId}>
                                                    {category.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setShowNewCategoryInput(true)}
                                            className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 flex items-center"
                                            title="Thêm danh mục mới"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {showNewCategoryInput && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nhập tên danh mục mới"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <button
                                                    onClick={handleCreateCategory}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                                    disabled={loading}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowNewCategoryInput(false)
                                                        setNewCategoryName("")
                                                        setCategoryError(null)
                                                    }}
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {categoryError && (
                                                <p className="mt-2 text-sm text-red-600">{categoryError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="originalPrice" className="flex items-center text-sm font-medium text-gray-700">
                                        <DollarSign className="w-4 h-4 mr-2 text-indigo-600" />
                                        Giá gốc <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            id="originalPrice"
                                            placeholder="Nhập giá gốc"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                        <span className="absolute left-3 top-2 text-gray-500">₫</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="quantityInStock" className="flex items-center text-sm font-medium text-gray-700">
                                        <Package className="w-4 h-4 mr-2 text-indigo-600" />
                                        Số lượng tồn <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantityInStock"
                                        id="quantityInStock"
                                        placeholder="Nhập số lượng tồn kho"
                                        value={formData.quantityInStock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                                    Mô tả sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <ImageIcon className="w-4 h-4 mr-2 text-indigo-600" />
                                    Hình ảnh sản phẩm
                                </label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
                                        imagePreviews.length > 0 ? "border-indigo-300" : "border-gray-300"
                                    }`}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        name="images"
                                        id="images"
                                        ref={fileInputRef}
                                        onChange={handleChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {imagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="max-h-32 mx-auto object-contain" />
                                                    {index === 0 && (
                                                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                                                            Ảnh chính
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            <p className="text-sm text-center text-gray-500">Nhấp để thay đổi hình ảnh</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <Upload className="w-12 h-12 mx-auto text-indigo-500" />
                                            <p className="text-gray-700 font-medium">Kéo thả hoặc nhấp để tải lên</p>
                                            <p className="text-sm text-gray-500">PNG, JPG, GIF (tối đa 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Xác nhận thông tin sản phẩm</h3>
                            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Tên sản phẩm</p>
                                    <p className="font-medium">{formData.productName || "Chưa có thông tin"}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Danh mục</p>
                                    <p className="font-medium">
                                        {categories.find((c) => c.categoryId === formData.categoryId)?.categoryName || "Chưa chọn danh mục"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Giá gốc</p>
                                    <p className="font-medium text-indigo-600">
                                        {formData.originalPrice
                                            ? `${Number.parseFloat(formData.originalPrice).toLocaleString("vi-VN")}₫`
                                            : "Chưa có thông tin"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Giá bán</p>
                                    <p className="font-medium text-indigo-600">
                                        {formData.originalPrice
                                            ? `${calculateSalePrice(formData.originalPrice).toLocaleString("vi-VN")}₫`
                                            : "Chưa có thông tin"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Số lượng tồn</p>
                                    <p className="font-medium">{formData.quantityInStock || "0"}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-sm text-gray-500">Mô tả</p>
                                    <p className="font-medium">{formData.description || "Không có mô tả"}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-sm text-gray-500">Hình ảnh</p>
                                    {imagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {imagePreviews.map((preview, index) => (
                                                <img
                                                    key={index}
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-32 object-contain"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Chưa có hình ảnh</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                            <Check className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between items-center">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Quay lại
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Hủy
                            </button>
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Tiếp theo
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
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
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}