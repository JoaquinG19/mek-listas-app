// src/utils/api.js
import axios from "axios";

// ✅ URL base de tu backend
//export const BASE_URL = "https://mekservicegestion.com/api";
export const BASE_URL = "http://192.168.1.209/sis-horas-conapis/public/api";
//export const BASE_URL = "http://192.168.100.39/sis-horas-conapis/public/api";

// ✅ Instancia de axios con baseURL preconfigurada
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
