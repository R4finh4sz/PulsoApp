import {
  changePasswordSchema,
  recoveryEmailSchema,
} from '@/validation/ForgotPassword.validation';
import { LoginSchema } from '@/validation/Login.validation';
import {
  isAtLeast15,
  parseBirthDate,
  RegisterSchema,
} from '@/validation/Register.validation';

it('aceita login válido e rejeita e-mail inválido ou senha vazia', () => {
  const valid = {
    email: 'student@pulso.app',
    password: 'secret',
    rememberMe: true,
  };
  expect(LoginSchema.safeParse(valid).success).toBe(true);
  expect(LoginSchema.safeParse({ ...valid, email: 'invalid' }).success).toBe(
    false,
  );
  expect(LoginSchema.safeParse({ ...valid, password: '' }).success).toBe(false);
});

it('remove espaços do e-mail de recuperação', () => {
  expect(
    recoveryEmailSchema.parse({ email: ' student@pulso.app ' }).email,
  ).toBe('student@pulso.app');
  expect(recoveryEmailSchema.safeParse({ email: 'invalid' }).success).toBe(
    false,
  );
});

it.each(['short1A', 'lowercase1', 'Password'])(
  'rejeita senha sem todos os requisitos: %s',
  password => {
    expect(
      changePasswordSchema.safeParse({ password, confirmPassword: password })
        .success,
    ).toBe(false);
  },
);

it('exige confirmação igual à nova senha', () => {
  expect(
    changePasswordSchema.safeParse({
      password: 'Password1',
      confirmPassword: 'Password1',
    }).success,
  ).toBe(true);
  const result = changePasswordSchema.safeParse({
    password: 'Password1',
    confirmPassword: 'Password2',
  });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].path).toEqual(['confirmPassword']);
  }
});

it('valida datas reais, anos bissextos e o limite de 15 anos', () => {
  expect(parseBirthDate('29/02/2024')).toBeInstanceOf(Date);
  expect(parseBirthDate('29/02/2023')).toBeNull();
  expect(parseBirthDate('31/04/2010')).toBeNull();
  expect(parseBirthDate('2010-10-08')).toBeNull();
  const today = new Date(2026, 9, 8);
  expect(isAtLeast15('08/10/2011', today)).toBe(true);
  expect(isAtLeast15('09/10/2011', today)).toBe(false);
});

describe('cadastro', () => {
  const values = {
    name: 'Ana Silva',
    birthDate: '01/01/2000',
    ra: '12345',
    cep: '01001-000',
    city: 'São Paulo',
    state: 'SP',
    schoolId: 'school-1',
    email: 'ana@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    termsAccepted: true,
  };

  it('aceita os dados completos', () => {
    expect(RegisterSchema.safeParse(values).success).toBe(true);
  });

  it.each([
    ['name', 'Ana'],
    ['ra', 'ABC'],
    ['cep', '123'],
    ['schoolId', ''],
    ['termsAccepted', false],
    ['confirmPassword', 'different'],
  ])('rejeita cadastro inválido no campo %s', (field, value) => {
    expect(
      RegisterSchema.safeParse({ ...values, [field]: value }).success,
    ).toBe(false);
  });
});
