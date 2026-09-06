import axios from 'axios';

const asMessage = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const getErrorMessage = (
  error: unknown,
  fallback = 'Houve um imprevisto, tente novamente mais tarde.',
): string => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      const nested = body.error;
      const nestedMessage =
        nested && typeof nested === 'object'
          ? asMessage((nested as Record<string, unknown>).message)
          : asMessage(nested);

      return nestedMessage || asMessage(body.message) || fallback;
    }
    return fallback;
  }

  if (error instanceof Error) {
    return asMessage(error.message) || fallback;
  }

  return asMessage(error) || fallback;
};
