import apiClient from './client';
import { ParentUser } from '../types/user';

export interface ParentLoginPayload {
  school_id: number;
  username: string;
  password: string;
}

export interface LoginResponse<T> {
  message: string;
  token: string;
  data: T;
}

type ParentProfile = Omit<ParentUser, 'role'>;

export const parentLogin = async (payload: ParentLoginPayload) => {
  const response = await apiClient.post<LoginResponse<ParentProfile>>('/api/v1/parent/login', payload);
  return {
    ...response.data,
    data: { ...response.data.data, role: 'parent' as const },
  };
};

export const getParentProfile = async () => {
  const response = await apiClient.get<{ message: string; data: ParentProfile }>('/api/v1/parent/me');
  return { ...response.data.data, role: 'parent' as const };
};

export const parentLogout = async () => {
  const response = await apiClient.post<{ message: string }>('/api/v1/parent/logout');
  return response.data;
};
