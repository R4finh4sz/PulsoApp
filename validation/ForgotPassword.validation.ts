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
    id: 'number',
    label: 'Um número',
    validate: (value: string) => /[0-9]/.test(value),
  },
];

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .refine(
        value =>
          passwordRequirements.every(requirement =>
            requirement.validate(value),
          ),
        'A senha deve atender aos requisitos abaixo.',
      ),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'As senhas devem ser iguais.',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const recoveryEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Digite um e-mail válido, como nome@gmail.com.'),
});
