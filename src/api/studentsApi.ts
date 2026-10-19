import apiClient from './client';
import { PaginatedResponse } from '../types/api';
import { StudentRecord } from '../types/management';

export interface StudentPayload {
  admission_no: string | null;
  full_name: string;
  parent_id: number;
  class_section_id: number;
  pickup_address: string | null;
  drop_address: string | null;
  is_active: boolean;
}

export const getStudents = async (params: { search?: string; per_page: number; page: number }) => {
  const response = await apiClient.get<PaginatedResponse<StudentRecord>>('/api/v1/students', { params });
  return response.data;
};

export const getStudent = async (id: number) => {
  const response = await apiClient.get<StudentRecord>(`/api/v1/students/${id}`);
  return response.data;
};

export const createStudent = async (payload: StudentPayload) => {
  const response = await apiClient.post<{ data: StudentRecord }>('/api/v1/students', payload);
  return response.data.data;
};

export const updateStudent = async (id: number, payload: StudentPayload) => {
  const response = await apiClient.put<{ data: StudentRecord }>(`/api/v1/students/${id}`, payload);
  return response.data.data;
};

export const deleteStudent = async (id: number) => {
  await apiClient.delete(`/api/v1/students/${id}`);
};
