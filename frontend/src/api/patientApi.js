import API from "./axios";

// ================= ADD =================
export const addPatientAPI = (data) => {
  return API.post("/patients", data);
};

// ================= GET (ACTIVE / TRASH) =================
export const getPatientsAPI = (showDeleted = false) => {
  return API.get(`/patients?deleted=${showDeleted}`);
};

// ================= UPDATE =================
export const updatePatientAPI = (id, data) => {
  return API.put(`/patients/${id}`, data);
};

// ================= DELETE (SOFT DELETE) =================
export const deletePatientAPI = (id) => {
  return API.delete(`/patients/${id}`);
};

// ================= RESTORE =================
export const restorePatientAPI = (id) => {
  return API.patch(`/patients/restore/${id}`);
};
