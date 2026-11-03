import axios from 'axios';

import { TUser } from '@/interfaces/user';
import api from '@/services/api';
import { Classroom } from '@/services/classrooms';
import { isMockEnabled, mockClassrooms, mockUser } from '@/services/mock';

export type StudentProfile = {
  user: TUser;
  schools: {
    id: string;
    name: string;
    city: string;
    state: string;
    cep: string;
  }[];
  classrooms: Classroom[];
  deletionRequest: {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    reason: string;
    reviewReason: string | null;
  } | null;
};

export const profileService = {
  get: async (signal?: AbortSignal): Promise<StudentProfile> =>
    isMockEnabled
      ? {
          user: mockUser,
          schools: [],
          classrooms: mockClassrooms,
          deletionRequest: null,
        }
      : (await api.get<StudentProfile>('/me/profile', { signal })).data,
  photo: async (signal?: AbortSignal): Promise<string | null> => {
    if (isMockEnabled) return null;
    let blob: Blob;
    try {
      blob = (
        await api.get<Blob>('/me/photo', { responseType: 'blob', signal })
      ).data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return null;
      throw error;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Não foi possível carregar a foto.'));
      reader.onerror = () =>
        reject(new Error('Não foi possível carregar a foto.'));
      reader.onabort = () =>
        reject(new Error('Carregamento da foto cancelado.'));
      reader.readAsDataURL(blob);
    });
  },
};
