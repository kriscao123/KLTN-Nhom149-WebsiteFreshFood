import axios from "axios";

const aiApi = axios.create({
  baseURL: (import.meta.env.VITE_AI_API_URL || "http://localhost:5001").replace(/\/$/, ""),
  withCredentials: false, 
});

export default aiApi;
