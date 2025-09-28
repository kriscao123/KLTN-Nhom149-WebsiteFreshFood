import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000/api/").replace(/\/$/, "/"),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const publicAuth = ["/auth/login", "/auth/request-otp", "/auth/verify-otp", "/auth/register"];
  const isPublicAuth = publicAuth.some((p) => config.url?.startsWith(p));
  if (token && !isPublicAuth) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;