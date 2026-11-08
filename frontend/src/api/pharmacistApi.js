import API from "./axios";

// GET PHARMACISTS
export const getPharmacistsAPI = (showDeleted = false) => {
  return API.get(`/pharmacists?deleted=${showDeleted}`);
};

// ADD PHARMACIST
export const addPharmacistAPI = (data) => {
  return API.post("/pharmacists", data);
};

// UPDATE PHARMACIST
export const updatePharmacistAPI = (id, data) => {
  return API.put(`/pharmacists/${id}`, data);
};

// TOGGLE STATUS
export const togglePharmacistStatusAPI = (id, status) => {
  return API.patch(`/pharmacists/${id}/status`, { status });
};

// DELETE PHARMACIST
export const deletePharmacistAPI = (id) => {
  return API.delete(`/pharmacists/${id}`);
};

// RESTORE PHARMACIST
export const restorePharmacistAPI = (id) => {
  return API.patch(`/pharmacists/${id}/restore`);
};

