import { TUser } from '@/interfaces/user';
import api, { Credentials } from '@/services/api';
import { LoginForm } from '@/validation/Login.validation';

const requireStudent = (user: TUser) => {
  if (user.role !== 'STUDENT') {
    throw new Error(
      'Este aplicativo é destinado aos alunos. Use uma conta de aluno.',
    );
  }
  return user;
};
export const authService = {
  login: async ({ email, password }: LoginForm) => {
    const credentials: Credentials = {
      username: email.trim().toLowerCase(),
      password,
    };
    const { data } = await api.get<TUser>('/me', { auth: credentials });
    return { user: requireStudent(data), credentials };
  },
  fetchUser: async () => requireStudent((await api.get<TUser>('/me')).data),
};
