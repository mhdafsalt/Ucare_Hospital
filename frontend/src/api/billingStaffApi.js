import API from "./axios";

// GET BILLING STAFF
export const getBillingStaffAPI = (showDeleted = false) => {
  return API.get(`/billing-staff?deleted=${showDeleted}`);
};

// ADD BILLING STAFF
export const addBillingStaffAPI = (data) => {
  return API.post("/billing-staff", data);
};

// UPDATE BILLING STAFF
export const updateBillingStaffAPI = (id, data) => {
  return API.put(`/billing-staff/${id}`, data);
};

// TOGGLE STATUS
export const toggleBillingStaffStatusAPI = (id, status) => {
  return API.patch(`/billing-staff/${id}/status`, { status });
};

// DELETE BILLING STAFF
export const deleteBillingStaffAPI = (id) => {
  return API.delete(`/billing-staff/${id}`);
};

// RESTORE BILLING STAFF
export const restoreBillingStaffAPI = (id) => {
  return API.patch(`/billing-staff/${id}/restore`);
};

