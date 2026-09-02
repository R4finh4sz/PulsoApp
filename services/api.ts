import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const baseURL = 'URL';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async config => {
    const withoutToken =
      config.url?.includes('createClient') ||
      config.url?.includes('auth/local') ||
      config.url?.includes('auth/local/refresh');

    if (withoutToken) {
      return config;
    }

    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers!.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export default api;

export const getImageUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  return `URL${url}`;
};
