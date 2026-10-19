import apiClient from './client';
import { PaginatedResponse } from '../types/api';
import { ParentRecord } from '../types/management';

export interface ParentPayload {
  full_name: string;
  phone: string;
  email: string | null;
  username: string | null;
  password?: string;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_active: boolean;
}

export const getParents = async (params: { search?: string; per_page: number; page: number }) => {
  const response = await apiClient.get<PaginatedResponse<ParentRecord>>('/api/v1/parents', { params });
  return response.data;
};

export const getParent = async (id: number) => {
  const response = await apiClient.get<ParentRecord>(`/api/v1/parents/${id}`);
  return response.data;
};

export const createParent = async (payload: ParentPayload) => {
  const response = await apiClient.post<{ data: ParentRecord }>('/api/v1/parents', payload);
  return response.data.data;
};

export const updateParent = async (id: number, payload: ParentPayload) => {
  const response = await apiClient.put<{ data: ParentRecord }>(`/api/v1/parents/${id}`, payload);
  return response.data.data;
};

export const deleteParent = async (id: number) => {
  await apiClient.delete(`/api/v1/parents/${id}`);
};
