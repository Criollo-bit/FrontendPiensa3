import axios from 'axios';

// Asegúrate de que tu backend esté corriendo en este puerto
const BASE_URL = 'http://localhost:3000'; 

export const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor: Antes de cada petición, inyecta el Token si existe en el localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});