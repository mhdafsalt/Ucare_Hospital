import API from "./axios";

// GET all doctors
export const getDoctorsAPI = (showDeleted = false) => API.get(`/doctors/allDoctors?showDeleted=${showDeleted}`);

// ADD doctor
export const addDoctorAPI = (data) => API.post("/doctors/addDoctors", data);

// UPDATE doctor
export const updateDoctorAPI = (id, data) =>
  API.put(`/doctors/updateDoctors/${id}`, data);

// DELETE doctor
export const deleteDoctorAPI = (id) =>
  API.delete(`/doctors/deleteDoctors/${id}`);

// RESTORE doctor
export const restoreDoctorAPI = (id) =>
  API.put(`/doctors/restoreDoctors/${id}`);