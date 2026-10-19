import apiClient from './client';
import { DriverUser } from '../types/user';

export interface DriverLoginPayload {
  school_id: number;
  username: string;
  password: string;
}

export interface DriverLoginResponse {
  message: string;
  token: string;
  data: Omit<DriverUser, 'role'>;
}

export const driverLogin = async (payload: DriverLoginPayload) => {
  const response = await apiClient.post<DriverLoginResponse>('/api/v1/driver/login', payload);
  return {
    ...response.data,
    data: { ...response.data.data, role: 'driver' as const },
  };
};

export const getDriverProfile = async () => {
  const response = await apiClient.get<{ message: string; data: Omit<DriverUser, 'role'> }>('/api/v1/driver/me');
  return { ...response.data.data, role: 'driver' as const };
};

export const driverLogout = async () => {
  const response = await apiClient.post<{ message: string }>('/api/v1/driver/logout');
  return response.data;
};
