import axios from "axios";

/**
 * Normalize and resolve the base API URL:
 * - Uses VITE_API_URL environment variable if set.
 * - In development without env, falls back to http://localhost:5000/api.
 * - In production without env, defaults to the deployed Vercel backend: https://ucare-hospital.vercel.app/api.
 * - Automatically ensures proper '/api' suffix and strips trailing slashes.
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === "") {
    return import.meta.env.DEV
      ? "http://localhost:5000/api"
      : "https://ucare-hospital.vercel.app/api";
  }
  const cleaned = envUrl.trim().replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
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
