import axios from "axios";

const aiApi = axios.create({
  // URL backend AI Flask (BE_python). Có thể cấu hình qua biến môi trường VITE_AI_API_URL
  baseURL: (import.meta.env.VITE_AI_API_URL || "http://localhost:5001").replace(/\/$/, ""),
  withCredentials: false, // AI không cần cookie/auth
});

export default aiApi;
