import axios from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    const firstValidationError = body?.errors
      ? Object.values(body.errors).flat()[0]
      : undefined;

    return firstValidationError ?? body?.message ?? body?.error ?? error.message;
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred.';
};
