import API from "./axios";

// GET ALL INVOICES
export const getInvoicesAPI = (params = {}) => {
  return API.get("/billing/invoices", { params });
};

// CREATE INVOICE
export const createInvoiceAPI = (data) => {
  return API.post("/billing/invoices", data);
};

// UPDATE INVOICE
export const updateInvoiceAPI = (id, data) => {
  return API.put(`/billing/invoices/${id}`, data);
};

// DELETE INVOICE
export const deleteInvoiceAPI = (id) => {
  return API.delete(`/billing/invoices/${id}`);
};

