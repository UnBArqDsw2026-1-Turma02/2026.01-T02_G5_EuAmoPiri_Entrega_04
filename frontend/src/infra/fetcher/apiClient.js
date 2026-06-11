/**
 * CAMADA INFRA — Fetcher
 *
 * Instância única do Axios (padrão Singleton) configurada para
 * comunicar com a API via proxy do Vite (/api → localhost:3000).
 *
 * Reutilização: todos os adaptors importam este cliente,
 * garantindo configuração centralizada (baseURL, headers, interceptors).
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/* Interceptor de requisição: adiciona token de auth quando disponível */
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

/* Interceptor de resposta: tratamento global de erros */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado: limpa storage e redireciona para login
      localStorage.removeItem('euamopiri_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
