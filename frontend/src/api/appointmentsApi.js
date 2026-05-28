import API from "./axios";

// ================= ADD =================
export const addAppointmentAPI = (data) => {
  return API.post("/appointments", data);
};

// ================= GET (ACTIVE / TRASH) =================
export const getAppointmentsAPI = (showDeleted = false) => {
  return API.get(`/appointments?deleted=${showDeleted}`);
};

// ================= UPDATE =================
export const updateAppointmentAPI = (id, data) => {
  return API.put(`/appointments/${id}`, data);
};

// ================= DELETE (SOFT DELETE) =================
export const deleteAppointmentAPI = (id) => {
  return API.delete(`/appointments/${id}`);
};

// ================= RESTORE =================
export const restoreAppointmentAPI = (id) => {
  return API.patch(`/appointments/restore/${id}`);
};
