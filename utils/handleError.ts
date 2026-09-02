import axios, { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

export const handleError = (
  err: AxiosError | string | Error | unknown,
): void => {
  console.log(JSON.stringify(err, null, 2));

  if (axios.isAxiosError(err)) {
    return Toast.show({
      type: 'error',
      text1: handleCustomErrors(err),
    });
  }

  if (err instanceof Error) {
    return Toast.show({
      type: 'error',
      text1: err.message,
    });
  }

  if (typeof err === 'string') {
    return Toast.show({
      type: 'error',
      text1: err,
    });
  }

  return Toast.show({
    type: 'error',
    text1: 'Houve um imprevisto, tente novamente mais tarde',
  });
};

export const handleSuccess = (message: string): void => {
  Toast.show({
    type: 'success',
    text1: message,
  });
};

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
  message?: string;
}

const handleCustomErrors = (error: AxiosError<ApiErrorResponse>): string => {
  const errorMessage =
    error.response?.data?.error?.message || error.response?.data?.message;

  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'Houve um imprevisto, tente novamente mais tarde';
  }

  if (errorMessage.includes('Too many requests, please try again later.')) {
    return 'Muitas requisições, tente mais tarde.';
  }

  if (errorMessage.includes('Your new password must be different')) {
    return 'Sua nova senha deve ser diferente da senha atual.';
  }

  if (
    errorMessage.includes('Passwords do not match') ||
    errorMessage.includes('The provided current password')
  ) {
    return 'Senha atual inválida';
  }

  if (errorMessage.includes('Invalid identifier or password')) {
    return 'Dados inválidos';
  }

  return errorMessage;
};
