// src/services/api.js
import axios from "axios";
import createMockApi from "./mockApi";

const useMock = import.meta.env.VITE_API_MOCK === "true";

const api = useMock
  ? createMockApi()
  : axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
      timeout: 10000,
    });

if (!useMock) {
  // Interceptor xử lý lỗi
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
}

export default api;
