import api from '@/services/api';
import { authService } from '@/services/auth';
import { termsService } from '@/services/terms';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@/services/mock', () => ({
  isMockEnabled: false,
  mockTerms: { version: '1.0' },
}));

const get = jest.mocked(api.get);
const post = jest.mocked(api.post);

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  post.mockResolvedValue({ data: {} });
});

describe('autenticação', () => {
  it('normaliza o e-mail e preserva o desafio de 2FA retornado', async () => {
    const response = { accessToken: 'token', twoFactorRequired: true };
    post.mockResolvedValue({ data: response });
    await expect(
      authService.login({
        email: ' Student@Pulso.app ',
        password: 'secret',
        rememberMe: true,
      }),
    ).resolves.toBe(response);
    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'student@pulso.app',
      password: 'secret',
    });
  });

  it('verifica o código, reenvia o desafio e encerra a sessão', async () => {
    const challenge = { resendAvailableAt: 'later' };
    post.mockResolvedValue({ data: challenge });
    await authService.verify('012345');
    await expect(authService.resend()).resolves.toBe(challenge);
    await authService.logout();
    expect(post.mock.calls).toEqual([
      ['/auth/2fa/verify', { code: '012345' }],
      ['/auth/2fa/resend'],
      ['/auth/logout'],
    ]);
  });

  it('retorna o perfil de aluno', async () => {
    const student = { id: 1, role: 'STUDENT' };
    get.mockResolvedValue({ data: student });
    await expect(authService.fetchUser()).resolves.toBe(student);
    expect(get).toHaveBeenCalledWith('/me');
  });

  it('rejeita o perfil de outro papel', async () => {
    get.mockResolvedValue({ data: { role: 'TEACHER' } });
    await expect(authService.fetchUser()).rejects.toThrow('conta de aluno');
  });

  it('propaga sessões inválidas e falhas de login', async () => {
    const failure = new Error('Unauthorized');
    get.mockRejectedValue(failure);
    post.mockRejectedValue(failure);
    await expect(authService.fetchUser()).rejects.toBe(failure);
    await expect(
      authService.login({
        email: 'a@b.com',
        password: 'secret',
        rememberMe: false,
      }),
    ).rejects.toBe(failure);
  });
});

describe('termos', () => {
  it('consulta o documento atual e as versões aceitas', async () => {
    const terms = { title: 'Termos', version: '1.10', content: 'Conteúdo' };
    get
      .mockResolvedValueOnce({ data: terms })
      .mockResolvedValueOnce({ data: ['1.0'] });
    await expect(termsService.current()).resolves.toBe(terms);
    await expect(termsService.accepted()).resolves.toEqual(['1.0']);
    expect(get.mock.calls).toEqual([['/terms'], ['/terms/accepted']]);
  });

  it('registra a versão exibida e propaga falhas de aceite', async () => {
    await termsService.accept('1.10');
    expect(post).toHaveBeenCalledWith('/terms/accept', {
      version: '1.10',
      termsAccepted: true,
    });
    const failure = new Error('Indisponível');
    post.mockRejectedValue(failure);
    await expect(termsService.accept('1.10')).rejects.toBe(failure);
  });
});
