import axios from "axios";
const API_URL = "http://localhost:2030";

export const createWhiteLabel = (formData) =>
  axios.post(`${API_URL}/whitelabel/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getWhiteLabels = () => axios.get(`${API_URL}/whitelabel/all`);
