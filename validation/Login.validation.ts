import z from './zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean(),
});

export type LoginForm = z.infer<typeof LoginSchema>;
