

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://planmint-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response } = err || {};
    const message =
      response?.data?.message ||
      response?.data?.error ||
      err?.message ||
      "Request failed";
    return Promise.reject({
      ...err,
      message,
      status: response?.status,
      data: response?.data,
    });
  }
);

export default api;
