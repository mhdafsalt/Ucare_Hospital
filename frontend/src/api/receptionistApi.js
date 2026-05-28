import API from "./axios";

// ================= ADD =================
export const addReceptionistAPI = (data) => {
  return API.post("/receptionists", data);
};

// ================= GET (ACTIVE / TRASH) =================
export const getReceptionistsAPI = (showDeleted = false) => {
  return API.get(`/receptionists?deleted=${showDeleted}`);
};

// ================= UPDATE =================
export const updateReceptionistAPI = (id, data) => {
  return API.put(`/receptionists/${id}`, data);
};

// ================= DELETE (SOFT DELETE) =================
export const deleteReceptionistAPI = (id) => {
  return API.delete(`/receptionists/${id}`);
};

// ================= RESTORE =================
export const restoreReceptionistAPI = (id) => {
  return API.patch(`/receptionists/restore/${id}`);
};