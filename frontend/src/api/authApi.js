import API from "./axios";

// LOGIN
export const loginAPI = (data) => API.post("/auth/login", data);

// SETUP ADMIN (Temporary)
export const setupAdminAPI = (data) => API.post("/auth/setup-admin", data);
