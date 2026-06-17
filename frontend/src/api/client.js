/**
 *  Cliente HTTP
 *
 * Instância única do Axios configurada para a API REST.
 * Dev: proxy Vite `/api` → localhost:3000.
 * Produção: configure VITE_API_URL no .env do frontend.
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('euamopiri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('euamopiri_token');
      localStorage.removeItem('euamopiri_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function postFormData(url, formData) {
  const token = localStorage.getItem('euamopiri_token');
  const response = await axios.post(`${baseURL}${url}`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 60000,
  });
  return response.data;
}

export async function patchFormData(url, formData) {
  const token = localStorage.getItem('euamopiri_token');
  const response = await axios.patch(`${baseURL}${url}`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 30000,
  });
  return response.data;
}

export async function fetchBlob(url) {
  const token = localStorage.getItem('euamopiri_token');
  const response = await fetch(`${baseURL}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = new Error('Falha ao carregar recurso');
    err.status = response.status;
    throw err;
  }
  return response.blob();
}

export default apiClient;
