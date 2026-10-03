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
    if (isMockEnabled) {
      return [1, 2, 3].map(number => ({
        id: `demo-school-${state}-${encodeURIComponent(city)}-${number}`,
        name: `Escola de demonstração ${number} — ${city}/${state}`,
      }));
    }
    const schools: RegistrationSchool[] = [];
    let page = 0;
    let totalPages = 1;
    do {
      // Each response determines whether another page exists.
      // eslint-disable-next-line no-await-in-loop
      const { data } = await publicApi.get<{
        content: RegistrationSchool[];
        totalPages: number;
      }>('/schools/search', { params: { city, state, page, size: 100 } });
      schools.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    } while (page < totalPages);
    return schools;
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
      name: values.name.trim(),
      role: 'STUDENT',
      ra: values.ra.trim(),
      cep: values.cep,
      city: values.city,
      state: values.state,
      schoolId: Number(values.schoolId),
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
    return (
      await publicApi.post<{ id: number; status: 'PENDING' }>(
        '/auth/register',
        body,
      )
    ).data;
  },
};
