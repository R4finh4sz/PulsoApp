import { newPasswordSchema } from './ForgotPassword.validation';
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

const getAge = (date: Date, today: Date) => {
  let age = today.getFullYear() - date.getFullYear();
  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age;
};

export const isAtLeast15 = (value: string, today = new Date()) => {
  const date = parseBirthDate(value);
  if (!date) {
    return false;
  }
  return getAge(date, today) >= 15;
};

export const isAtMost90 = (value: string, today = new Date()) => {
  const date = parseBirthDate(value);
  if (!date) {
    return false;
  }
  return getAge(date, today) <= 90;
};

export const requiresGuardian = (value: string, today = new Date()) => {
  const date = parseBirthDate(value);
  if (!date) {
    return false;
  }
  const year = today.getFullYear() - 18;
  const month = today.getMonth();
  const day = Math.min(today.getDate(), new Date(year, month + 1, 0).getDate());
  const adultBirthDate = new Date(year, month, day);
  return date > adultBirthDate;
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
      )
      .refine(
        value => !parseBirthDate(value) || isAtMost90(value),
        'A idade máxima permitida é de 90 anos',
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
    schoolId: z.string().regex(/^[1-9]\d*$/, 'Selecione sua escola'),
    email: z
      .string()
      .trim()
      .max(254, 'Informe no máximo 254 caracteres')
      .email('Informe um e-mail válido'),
    password: newPasswordSchema,
    guardianName: z
      .string()
      .trim()
      .max(100, 'Informe no máximo 100 caracteres')
      .optional(),
    guardianEmail: z
      .string()
      .trim()
      .max(254, 'Informe no máximo 254 caracteres')
      .optional(),
    privacyAccepted: z
      .boolean()
      .refine(
        Boolean,
        'Você precisa aceitar a política de privacidade para continuar',
      ),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    termsAccepted: z
      .boolean()
      .refine(Boolean, 'Você precisa aceitar os termos para continuar'),
  })
  .superRefine((data, ctx) => {
    if (!requiresGuardian(data.birthDate)) {
      return;
    }
    if (!data.guardianName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['guardianName'],
        message: 'Informe o nome do responsável legal',
      });
    }
    if (
      !data.guardianEmail ||
      !z.string().email().safeParse(data.guardianEmail).success
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['guardianEmail'],
        message: 'Informe um e-mail válido do responsável legal',
      });
    } else if (data.guardianEmail.toLowerCase() === data.email.toLowerCase()) {
      ctx.addIssue({
        code: 'custom',
        path: ['guardianEmail'],
        message:
          'O e-mail do responsável deve ser diferente do e-mail do aluno',
      });
    }
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterForm = z.infer<typeof RegisterSchema>;
