import axios, { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

import { useErrorModal } from '@/store/errorModalStore';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const handleError = (
  err: AxiosError | string | Error | unknown,
): void => {
  useErrorModal.getState().openErrorModal({
    message: axios.isAxiosError(err)
      ? handleCustomErrors(err)
      : getErrorMessage(err, 'Houve um imprevisto, tente novamente mais tarde'),
  });
};

export const handleSuccess = (message: string): void => {
  Toast.show({
    type: 'success',
    text1: message,
  });
};

const handleCustomErrors = (error: AxiosError): string => {
  const errorMessage = getErrorMessage(
    error,
    'Houve um imprevisto, tente novamente mais tarde',
  );

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
