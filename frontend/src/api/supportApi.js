import axiosInstance from "./axios";

// Create a support ticket
export const addSupport = async (supportData) => {
  try {
    const response = await axiosInstance.post("/supports", supportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all support tickets
export const getSupports = async () => {
  try {
    const response = await axiosInstance.get("/supports");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
