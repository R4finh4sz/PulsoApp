import api, { baseURL, getImageUrl, setApiToken } from '@/services/api';

afterEach(() => setApiToken(null));

it('adiciona e remove o token Bearer sem armazenar credenciais Basic', () => {
  setApiToken('test-token');
  expect(api.defaults.headers.common.Authorization).toBe('Bearer test-token');
  expect(api.defaults.auth).toBeUndefined();
  setApiToken(null);
  expect(api.defaults.headers.common.Authorization).toBeUndefined();
});

it('resolve fotos relativas à origem da API e preserva URLs absolutas', () => {
  expect(getImageUrl('/uploads/photo.jpg')).toBe(
    new URL('/uploads/photo.jpg', baseURL).toString(),
  );
  expect(getImageUrl('https://example.com/photo.jpg')).toBe(
    'https://example.com/photo.jpg',
  );
  expect(getImageUrl()).toBe('');
});
