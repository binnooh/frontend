import apiClient from './client';
import { ApiResponse } from '../types/api';
import { School } from '../types/school';

export const getSchools = async () => {
  const response = await apiClient.get<ApiResponse<School[]>>('/api/v1/schools');
  return response.data;
};

export const checkSchool = async (schoolId: string) => {
  const response = await apiClient.get<ApiResponse<School>>(`/api/v1/schools/${encodeURIComponent(schoolId)}`);
  return response.data;
};
