import axios from 'axios';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { registrationService } from '@/services/registration';
import { RegisterForm } from '@/validation/Register.validation';

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(() => ({ get: jest.fn(), post: jest.fn() })) },
}));
jest.mock('@/services/api', () => ({ baseURL: 'http://localhost:8080/api' }));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));
const client = jest.mocked(axios.create).mock.results[0].value;
const values: RegisterForm = {
  name: 'Ana Silva',
  birthDate: '08/10/2000',
  ra: '1234',
  cep: '01001-000',
  city: 'São Paulo',
  state: 'SP',
  schoolId: '1',
  email: ' Ana@Pulso.App ',
  password: 'Password1',
  confirmPassword: 'Password1',
  termsAccepted: true,
};
afterEach(() => jest.restoreAllMocks());

it('consulta os termos publicados e todas as páginas de escolas reais', async () => {
  client.get
    .mockResolvedValueOnce({ data: { version: '1.0', content: 'Termos' } })
    .mockResolvedValueOnce({
      data: { content: [{ id: '1', name: 'Escola A' }], totalPages: 2 },
    })
    .mockResolvedValueOnce({
      data: { content: [{ id: '2', name: 'Escola B' }], totalPages: 2 },
    });
  await expect(registrationService.terms()).resolves.toEqual({
    version: '1.0',
    content: 'Termos',
  });
  expect(client.get).toHaveBeenCalledWith('/terms');
  await expect(registrationService.schools('08970000')).resolves.toEqual([
    { id: '1', name: 'Escola A' },
    { id: '2', name: 'Escola B' },
  ]);
  expect(client.get).toHaveBeenCalledWith('/schools/search', {
    params: { cep: '08970000', page: 0, size: 100 },
  });
  expect(client.get).toHaveBeenCalledWith('/schools/search', {
    params: { cep: '08970000', page: 1, size: 100 },
  });
});

it('retorna lista vazia quando não há escolas e propaga falha de rede', async () => {
  client.get.mockResolvedValueOnce({ data: { content: [], totalPages: 0 } });
  await expect(registrationService.schools('08970000')).resolves.toEqual([]);
  const failure = new Error('Offline');
  client.get.mockRejectedValueOnce(failure);
  await expect(registrationService.schools('08970000')).rejects.toBe(failure);
});

it('envia multipart com dados normalizados e sem confirmação da senha', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  await registrationService.submit(values, '1.10', null);
  expect(client.post).toHaveBeenCalledWith(
    '/auth/register',
    expect.any(FormData),
  );
  const payload = JSON.parse(String(append.mock.calls[0][1]));
  expect(payload).toMatchObject({
    email: 'ana@pulso.app',
    cep: '01001000',
    birthDate: '2000-10-08',
    termsVersion: '1.10',
    termsAccepted: true,
    schoolId: 1,
  });
  expect(payload).not.toHaveProperty('confirmPassword');
  expect(append).toHaveBeenCalledTimes(1);
});

it('inclui foto nativa com nome e tipo padrão', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  await registrationService.submit(values, '1.0', {
    uri: 'file:///photo.jpg',
  } as ImagePickerAsset);
  expect(append).toHaveBeenCalledWith('photo', {
    uri: 'file:///photo.jpg',
    name: 'profile.jpg',
    type: 'image/jpeg',
  });
});

it('preserva nome e tipo de foto nativa', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  await registrationService.submit(values, '1.0', {
    uri: 'file:///photo.png',
    fileName: 'photo.png',
    mimeType: 'image/png',
  } as ImagePickerAsset);
  expect(append).toHaveBeenCalledWith('photo', {
    uri: 'file:///photo.png',
    name: 'photo.png',
    type: 'image/png',
  });
});

it('envia arquivo web sem refazer download quando já disponível', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const append = jest
    .spyOn(FormData.prototype, 'append')
    .mockImplementation(() => {});
  const file = new Blob(['photo']);
  await registrationService.submit(values, '1.0', {
    uri: 'blob:photo',
    file,
    fileName: 'avatar.jpg',
  } as ImagePickerAsset);
  expect(append).toHaveBeenCalledWith('photo', file, 'avatar.jpg');
});

it('baixa foto web quando o picker não fornece arquivo', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const file = new Blob(['photo']);
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue({ blob: async () => file } as Response);
  const append = jest
    .spyOn(FormData.prototype, 'append')
    .mockImplementation(() => {});
  await registrationService.submit(values, '1.0', {
    uri: 'blob:photo',
  } as ImagePickerAsset);
  expect(fetchMock).toHaveBeenCalledWith('blob:photo');
  expect(append).toHaveBeenCalledWith('photo', file, 'profile.jpg');
});
