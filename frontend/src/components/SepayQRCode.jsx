// SepayQRCode.jsx
import { useState, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const SepayQRCode = ({ paymentId, qrCodeUrl, amount, transactionTimeout, onSuccess }) => {
    const [status, setStatus] = useState("PENDING");
    const [timeLeft, setTimeLeft] = useState(transactionTimeout || 300);
    const BASE_API_URL = process.env.REACT_APP_API_URL || "https://websitebandogiadung-dqzs.onrender.com";
    const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || "https://websitebandogiadung-dqzs.onrender.com/ws";

    useEffect(() => {
        console.log("Initializing SepayQRCode for paymentId:", paymentId);
        const socket = new SockJS(WEBSOCKET_URL);
        const stompClient = Stomp.over(socket);
        let isConnected = false;

        stompClient.connect(
            {},
            () => {
                console.log("WebSocket connected");
                isConnected = true;
                stompClient.subscribe("/topic/transactions", message => {
                    console.log("WebSocket raw message:", message);
                    console.log("WebSocket message body:", message.body);
                    try {
                        const data = JSON.parse(message.body);
                        console.log("Parsed WebSocket data:", data);
                        if (data.paymentId === paymentId) {
                            console.log("Matched paymentId, updating status to:", data.status);
                            setStatus(data.status);
                            if (data.status === "COMPLETED") {
                                console.log("Calling onSuccess for paymentId:", paymentId);
                                setTimeLeft(0);
                                onSuccess();
                            } else if (data.status === "FAILED" || data.status === "EXPIRED") {
                                setTimeLeft(0);
                                toast.error(`Giao dịch ${data.status === "FAILED" ? "thất bại" : "hết hạn"}`);
                            }
                        } else {
                            console.log("PaymentId mismatch:", data.paymentId, "vs", paymentId);
                        }
                    } catch (err) {
                        console.error("Error parsing WebSocket message:", err);
                    }
                });
            },
            error => {
                console.error("WebSocket error:", error);
                toast.error("Lỗi kết nối WebSocket");
            }
        );

        const pollingInterval = setInterval(async () => {
            try {
                console.log("Polling for paymentId:", paymentId);
                const response = await fetch(`${BASE_API_URL}/api/payments/${paymentId}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log("Polling received data:", data);
                if (data.status !== status) {
                    console.log("Polling updating status to:", data.status);
                    setStatus(data.status);
                    if (data.status === "COMPLETED") {
                        console.log("Calling onSuccess for paymentId:", paymentId);
                        setTimeLeft(0);
                        onSuccess();
                    } else if (data.status === "FAILED" || data.status === "EXPIRED") {
                        setTimeLeft(0);
                        toast.error(`Giao dịch ${data.status === "FAILED" ? "thất bại" : "hết hạn"}`);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra trạng thái giao dịch:", err);
            }
        }, 2000);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1 || status !== "PENDING") {
                    if (prev <= 1 && status === "PENDING") {
                        setStatus("EXPIRED");
                        toast.error("Giao dịch đã hết hạn");
                    }
                    clearInterval(timer); // Dừng timer khi status không phải PENDING
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        if (timeLeft <= 30 && status === "PENDING") {
            toast("Vui lòng hoàn tất thanh toán trong 30 giây!", { icon: "⏰" });
        }

        return () => {
            console.log("Cleaning up for paymentId:", paymentId);
            if (isConnected) {
                stompClient.disconnect(() => {
                    console.log("WebSocket disconnected");
                });
            }
            clearInterval(pollingInterval);
            clearInterval(timer);
        };
    }, [paymentId, status, timeLeft, onSuccess]);

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Quét mã QR để thanh toán</h3>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
            <p className="text-gray-600 mb-2">Mã giao dịch: {paymentId}</p>
            <p className="text-gray-600 mb-2">
                Số tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
            </p>
            <p className="text-gray-600 mb-4">
                Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </p>
            <div className="flex justify-center items-center">
                {status === "PENDING" && (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                )}
                {status === "COMPLETED" && <CheckCircle size={24} className="text-green-500 mr-2" />}
                {(status === "FAILED" || status === "EXPIRED") && (
                    <AlertTriangle size={24} className="text-red-500 mr-2" />
                )}
                <span className="text-gray-800">
                    {status === "PENDING" && "Đang chờ thanh toán..."}
                    {status === "COMPLETED" && "Thanh toán thành công!"}
                    {status === "FAILED" && "Thanh toán thất bại"}
                    {status === "EXPIRED" && "Giao dịch đã hết hạn"}
                </span>
            </div>
        </div>
    );
};

export default SepayQRCode;