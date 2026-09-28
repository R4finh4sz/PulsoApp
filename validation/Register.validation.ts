import z from './zod';

export const parseBirthDate = (value: string) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return null;
  }
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
};

export const isAtLeast15 = (value: string, today = new Date()) => {
  const date = parseBirthDate(value);
  if (!date) {
    return false;
  }
  let age = today.getFullYear() - date.getFullYear();
  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age >= 15;
};

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(50, 'Informe no máximo 50 caracteres')
      .min(2, 'Informe seu nome completo')
      .refine(
        value => value.split(/\s+/).length >= 2,
        'Informe nome e sobrenome',
      ),
    birthDate: z
      .string()
      .refine(
        value => !!parseBirthDate(value),
        'Informe uma data válida (DD/MM/AAAA)',
      )
      .refine(
        value => !parseBirthDate(value) || isAtLeast15(value),
        'É necessário ter pelo menos 15 anos',
      ),
    ra: z
      .string()
      .trim()
      .min(1, 'Informe seu RA')
      .max(30, 'Informe no máximo 30 caracteres')
      .regex(/^\d+$/, 'O RA deve conter apenas números'),
    cep: z
      .string()
      .refine(
        value => value.replace(/\D/g, '').length === 8,
        'Informe um CEP válido',
      ),
    city: z.string().min(1, 'Consulte o CEP para preencher a cidade'),
    state: z.string().length(2, 'Consulte o CEP para preencher o estado'),
    schoolId: z.string().min(1, 'Selecione sua escola'),
    email: z.string().trim().email('Informe um e-mail válido'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    termsAccepted: z
      .boolean()
      .refine(Boolean, 'Você precisa aceitar os termos para continuar'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterForm = z.infer<typeof RegisterSchema>;
