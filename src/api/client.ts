import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const configuredApiUrl = process.env.REACT_APP_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('schoolbus_token');

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
