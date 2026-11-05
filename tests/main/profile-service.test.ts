import api from '@/services/api';
import { profileService } from '@/services/profile';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));

const originalFileReader = Object.getOwnPropertyDescriptor(
  globalThis,
  'FileReader',
);

it('envia motivo e senha para solicitar exclusão e propaga falhas', async () => {
  const input = {
    reason: 'Não utilizo mais a plataforma.',
    currentPassword: 'senha',
  };
  await profileService.requestDeletion(input);
  expect(api.post).toHaveBeenCalledWith('/me/deletion-requests', input);
  jest.mocked(api.post).mockRejectedValueOnce(new Error('Senha incorreta'));
  await expect(profileService.requestDeletion(input)).rejects.toThrow(
    'Senha incorreta',
  );
});
it('lista solicitações usando o sinal de cancelamento', async () => {
  const signal = new AbortController().signal;
  jest.mocked(api.get).mockResolvedValueOnce({ data: [] });
  await expect(profileService.deletionRequests(signal)).resolves.toEqual([]);
  expect(api.get).toHaveBeenCalledWith('/me/deletion-requests', { signal });
});

beforeAll(() => {
  // Jest não inicializa o FileReader nativo usado pelo app.
  Object.defineProperty(globalThis, 'FileReader', {
    configurable: true,
    value: class {
      result = null;

      onload = null;

      onerror = null;

      readAsDataURL() {}
    },
  });
});
afterAll(() => {
  if (originalFileReader) {
    Object.defineProperty(globalThis, 'FileReader', originalFileReader);
  } else {
    Reflect.deleteProperty(globalThis, 'FileReader');
  }
});

afterEach(() => jest.restoreAllMocks());

it('consulta o perfil completo usando o cliente autenticado e o sinal de cancelamento', async () => {
  const profile = {
    user: { id: 1 },
    schools: [],
    classrooms: [],
    deletionRequest: null,
  };
  const { signal } = new AbortController();
  jest.mocked(api.get).mockResolvedValue({ data: profile });
  await expect(profileService.get(signal)).resolves.toBe(profile);
  expect(api.get).toHaveBeenCalledWith('/me/profile', { signal });
});

it('consulta o PNG autenticado e converte o blob em imagem em memória', async () => {
  const blob = new Blob(['photo'], { type: 'image/png' });
  jest.mocked(api.get).mockResolvedValue({ data: blob });
  const read = jest
    .spyOn(FileReader.prototype, 'readAsDataURL')
    .mockImplementation(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        value: 'data:image/png;base64,cGhvdG8=',
      });
      this.onload?.({ target: this } as ProgressEvent<FileReader>);
    });
  await expect(profileService.photo()).resolves.toBe(
    'data:image/png;base64,cGhvdG8=',
  );
  expect(api.get).toHaveBeenCalledWith('/me/photo', {
    responseType: 'blob',
    signal: undefined,
  });
  expect(read).toHaveBeenCalledWith(blob);
});

it('trata somente 404 como foto ausente', async () => {
  jest
    .mocked(api.get)
    .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
  await expect(profileService.photo()).resolves.toBeNull();
  const error = new Error('Sem conexão');
  jest.mocked(api.get).mockRejectedValueOnce(error);
  await expect(profileService.photo()).rejects.toBe(error);
});

it('propaga a falha de leitura da foto para permitir nova tentativa', async () => {
  jest.mocked(api.get).mockResolvedValue({ data: new Blob() });
  jest
    .spyOn(FileReader.prototype, 'readAsDataURL')
    .mockImplementation(function (this: FileReader) {
      this.onerror?.({ target: this } as ProgressEvent<FileReader>);
    });
  await expect(profileService.photo()).rejects.toThrow(
    'Não foi possível carregar a foto.',
  );
});
