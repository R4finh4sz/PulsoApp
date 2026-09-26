import axios from 'axios';
import { Platform } from 'react-native';

export const baseURL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api')
).replace(/\/$/, '');
const api = axios.create({ baseURL, timeout: 15000 });
export const setApiToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
export default api;
export const getImageUrl = (url?: string) =>
  url ? new URL(url, `${baseURL.replace(/\/api$/, '')}/`).toString() : '';
