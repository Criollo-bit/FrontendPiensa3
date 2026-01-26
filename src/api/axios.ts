import axios from 'axios';

// URL de Railway (asegúrate que sea la de tu panel)
const RAILWAY_URL = 'https://backend-piensa-production.up.railway.app'; 

// 🔥 FUERZA EL USO DE RAILWAY PARA PROBAR LA NUBE
const BASE_URL = RAILWAY_URL; 

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => { 
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  },
  (error) => {
    // ESTO ES NUEVO: Para ver errores de configuración de la petición
    console.error("Error en el interceptor de petición:", error);
    return Promise.reject(error);

});