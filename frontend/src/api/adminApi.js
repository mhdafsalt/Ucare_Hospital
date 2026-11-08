import API from "./axios";

// GET COMPLETE ADMIN DASHBOARD OVERVIEW
export const getAdminDashboardOverviewAPI = () => {
  return API.get("/admin/dashboard-overview");
};

// GET ACTIVITIES
export const getAdminActivitiesAPI = () => {
  return API.get("/admin/activities");
};

// CREATE ACTIVITY
export const createAdminActivityAPI = (data) => {
  return API.post("/admin/activities", data);
};

