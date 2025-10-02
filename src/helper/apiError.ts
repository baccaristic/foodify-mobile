import { isAxiosError } from 'axios';

interface ErrorResponseBody {
  message?: string;
  error?: string;
  errors?: string[];
}

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ErrorResponseBody | undefined;
    if (data) {
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0];
      }
    }
  } else if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
