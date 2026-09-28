import axios from 'axios';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { baseURL } from '@/services/api';
import { isMockEnabled, mockTerms } from '@/services/mock';
import { RegisterForm } from '@/validation/Register.validation';

const publicApi = axios.create({ baseURL, timeout: 15000 });
export type RegistrationSchool = { id: string; name: string };
export type RegistrationTerms = {
  title: string;
  version: string;
  content: string;
};

export const registrationService = {
  schools: async (
    city: string,
    state: string,
  ): Promise<RegistrationSchool[]> => {
    return [1, 2, 3].map(number => ({
      id: `demo-school-${state}-${encodeURIComponent(city)}-${number}`,
      name: `Escola de demonstração ${number} — ${city}/${state}`,
    }));
  },
  terms: async (): Promise<RegistrationTerms> => {
    if (isMockEnabled) {
      return mockTerms;
    }
    return (await publicApi.get<RegistrationTerms>('/terms')).data;
  },
  submit: async (
    values: RegisterForm,
    termsVersion: string,
    photo: ImagePickerAsset | null,
  ) => {
    if (isMockEnabled) {
      return;
    }
    const fields = {
      name: values.name,
      ra: values.ra,
      cep: values.cep,
      city: values.city,
      state: values.state,
      schoolId: values.schoolId,
      email: values.email,
      password: values.password,
      termsAccepted: values.termsAccepted,
    };
    const { birthDate } = values;
    const [day, month, year] = birthDate.split('/');
    const payload = {
      ...fields,
      email: fields.email.trim().toLowerCase(),
      cep: fields.cep.replace(/\D/g, ''),
      birthDate: `${year}-${month}-${day}`,
      termsVersion,
    };
    const body = new FormData();
    body.append('data', JSON.stringify(payload));
    if (photo) {
      if (Platform.OS === 'web') {
        const blob = photo.file ?? (await (await fetch(photo.uri)).blob());
        body.append('photo', blob, photo.fileName ?? 'profile.jpg');
      } else {
        body.append('photo', {
          uri: photo.uri,
          name: photo.fileName ?? 'profile.jpg',
          type: photo.mimeType ?? 'image/jpeg',
        } as unknown as Blob);
      }
    }
    await publicApi.post('/auth/register', body);
  },
};
