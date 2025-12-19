import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

/**
 * SepayQRCode (Polling version - no WebSocket)
 *
 * Props (giữ tương thích với CheckoutPage.jsx hiện tại):
 * - paymentId: string (thường là orderId hoặc mã giao dịch bạn dùng để tra cứu)
 * - qrCodeUrl: string (URL ảnh QR)
 * - amount: number
 * - transactionTimeout: number (giây) - mặc định 300s
 * - onSuccess: () => void
 *
 * Backend cần có endpoint trả trạng thái:
 * - Ưu tiên: GET /api/sepay/order-status/:orderId
 * - Hoặc:   GET /api/order/:id (có paymentStatus)
 */
const SepayQRCode = ({ paymentId, qrCodeUrl, amount, transactionTimeout, onSuccess }) => {
  const timeoutSec = useMemo(() => {
    const n = Number(transactionTimeout);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300;
  }, [transactionTimeout]);

  const [status, setStatus] = useState("PENDING"); // PENDING | COMPLETED | FAILED | EXPIRED
  const [timeLeft, setTimeLeft] = useState(timeoutSec);
  const [isChecking, setIsChecking] = useState(false);

  const stopRef = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const isTerminal = (s) => ["COMPLETED", "FAILED", "EXPIRED"].includes(s);

  const normalizeStatusFromOrder = (data) => {
    // 1) Nếu backend trả trực tiếp { status: "COMPLETED" }
    if (data?.status && typeof data.status === "string") return data.status.toUpperCase();

    // 2) Nếu backend trả Order { paymentStatus: "Completed" | "Pending" | ... }
    const ps = data?.paymentStatus || data?.order?.paymentStatus;
    if (ps && typeof ps === "string") {
      const v = ps.toUpperCase();
      if (v.includes("COMP")) return "COMPLETED";
      if (v.includes("FAIL")) return "FAILED";
      if (v.includes("PEND")) return "PENDING";
    }

    // 3) Nếu backend trả { orderStatus: "CONFIRMED" } mà paymentStatus thiếu
    const os = data?.orderStatus || data?.order?.orderStatus;
    if (os && typeof os === "string") {
      const v = os.toUpperCase();
      if (v === "CONFIRMED" || v === "PAID") return "COMPLETED";
    }

    return null;
  };

  const fetchStatus = async () => {
    if (!paymentId) return;

    setIsChecking(true);
    try {
      // Ưu tiên /sepay/order-status/:id (dễ chuẩn hoá cho polling)
      let res;
      try {
        res = await api.get(`/sepay/order-status/${paymentId}`);
      } catch (e1) {
        // fallback: nếu bạn có GET /order/:id
        res = await api.get(`/order/${paymentId}`);
      }

      const next = normalizeStatusFromOrder(res?.data);
      if (!next) return;

      if (next !== statusRef.current) {
        setStatus(next);

        if (next === "COMPLETED") {
          toast.success("Thanh toán thành công!");
          stopRef.current = true;
          onSuccess?.();
        }

        if (next === "FAILED") {
          toast.error("Thanh toán thất bại");
          stopRef.current = true;
        }
      }
    } catch (err) {
      console.error("Poll order status error:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    stopRef.current = false;
    setStatus("PENDING");
    setTimeLeft(timeoutSec);

    if (!paymentId) return;

    const pollMs = 3000;
    const poll = setInterval(() => {
      if (stopRef.current) return;
      if (isTerminal(statusRef.current)) return;
      fetchStatus();
    }, pollMs);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (stopRef.current) return t;
        if (t <= 1) {
          if (!isTerminal(statusRef.current)) {
            setStatus("EXPIRED");
            toast.error("Giao dịch đã hết hạn");
          }
          stopRef.current = true;
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // kiểm tra ngay lần đầu
    fetchStatus();

    return () => {
      clearInterval(poll);
      clearInterval(timer);
      stopRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, timeoutSec]);

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-4">Quét mã QR để thanh toán</h3>

      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
      ) : (
        <div className="mx-auto mb-4 w-48 h-48 flex items-center justify-center border rounded">
          <span className="text-gray-500 text-sm">Không có QR</span>
        </div>
      )}

      <p className="text-gray-600 mb-2">Mã giao dịch/Đơn: {paymentId || "-"}</p>

      <p className="text-gray-600 mb-2">
        Số tiền:{" "}
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount || 0))}
      </p>

      <p className="text-gray-600 mb-4">
        Thời gian còn lại: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </p>

      <div className="flex justify-center items-center">
        {status === "PENDING" && (
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
        )}
        {status === "COMPLETED" && <CheckCircle size={24} className="text-green-500 mr-2" />}
        {(status === "FAILED" || status === "EXPIRED") && <AlertTriangle size={24} className="text-red-500 mr-2" />}

        <span className="text-gray-800">
          {status === "PENDING" && (isChecking ? "Đang kiểm tra thanh toán..." : "Đang chờ thanh toán...")}
          {status === "COMPLETED" && "Thanh toán thành công!"}
          {status === "FAILED" && "Thanh toán thất bại"}
          {status === "EXPIRED" && "Giao dịch đã hết hạn"}
        </span>
      </div>
    </div>
  );
};

export default SepayQRCode;
