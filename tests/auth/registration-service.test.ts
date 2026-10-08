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

it('consulta termos públicos e retorna escolas demonstrativas por cidade', async () => {
  client.get.mockResolvedValue({ data: { version: '1.0', content: 'Termos' } });
  await expect(registrationService.terms()).resolves.toEqual({
    version: '1.0',
    content: 'Termos',
  });
  expect(client.get).toHaveBeenCalledWith('/terms');
  const schools = await registrationService.schools('São Paulo', 'SP');
  expect(schools).toHaveLength(3);
  expect(schools[0].name).toContain('São Paulo/SP');
  expect(schools[0].id).toContain('SP-S%C3%A3o%20Paulo');
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
