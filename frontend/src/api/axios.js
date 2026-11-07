import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired, clear local storage without forcing an imperative page reload
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config && error.config.url && error.config.url.includes("/auth/");
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("isLoggedIn");
      }
    }
    return Promise.reject(error);
  }
);

export default API;