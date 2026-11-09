import z from 'zod/v3';

export const passwordRequirements = [
  {
    id: 'length',
    label: 'Pelo menos 8 caracteres',
    validate: (value: string) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula',
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'bytes',
    label: 'No máximo 72 bytes UTF-8',
    validate: (value: string) => new Blob([value]).size <= 72,
  },
  {
    id: 'number',
    label: 'Um número',
    validate: (value: string) => /[0-9]/.test(value),
  },
];

export const newPasswordSchema = z
  .string()
  .refine(
    value =>
      passwordRequirements.every(requirement => requirement.validate(value)),
    'Use pelo menos 8 caracteres, uma maiúscula de A a Z, um número e no máximo 72 bytes UTF-8.',
  );

export const changePasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'As senhas devem ser iguais.',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const profilePasswordSchema = changePasswordSchema.and(
  z.object({ currentPassword: z.string().min(1, 'Digite sua senha atual.') }),
);
export type ProfilePasswordForm = z.infer<typeof profilePasswordSchema>;

export const recoveryEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Digite um e-mail válido, como nome@gmail.com.'),
});
