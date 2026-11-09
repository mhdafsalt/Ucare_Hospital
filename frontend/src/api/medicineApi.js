import API from "./axios";

// GET ALL MEDICINES
export const getMedicinesAPI = (params = {}) => {
  return API.get("/pharmacy", { params });
};

// ADD MEDICINE
export const addMedicineAPI = (data) => {
  return API.post("/pharmacy", data);
};

// UPDATE MEDICINE
export const updateMedicineAPI = (id, data) => {
  return API.put(`/pharmacy/${id}`, data);
};

// RESTOCK MEDICINE
export const restockMedicineAPI = (id, amount = 100) => {
  return API.patch(`/pharmacy/${id}/restock`, { amount });
};

// TOGGLE QUARANTINE STATUS
export const quarantineMedicineAPI = (id) => {
  return API.patch(`/pharmacy/${id}/quarantine`);
};

// DISPENSE MEDICINE (RECORD SALE)
export const dispenseMedicineAPI = (data) => {
  return API.post("/pharmacy/dispense", data);
};

// GET SALES HISTORY
export const getPharmacySalesAPI = () => {
  return API.get("/pharmacy/sales");
};

// UPDATE SALE RECORD
export const updatePharmacySaleAPI = (id, data) => {
  return API.put(`/pharmacy/sales/${id}`, data);
};

// DELETE SALE RECORD
export const deletePharmacySaleAPI = (id) => {
  return API.delete(`/pharmacy/sales/${id}`);
};

// DELETE MEDICINE
export const deleteMedicineAPI = (id) => {
  return API.delete(`/pharmacy/${id}`);
};

