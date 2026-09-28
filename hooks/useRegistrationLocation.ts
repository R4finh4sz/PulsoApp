import { useEffect, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

import { getAdressByZipCode } from '@/services/cep';
import {
  RegistrationSchool,
  registrationService,
} from '@/services/registration';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { RegisterForm } from '@/validation/Register.validation';

export const useRegistrationLocation = ({
  control,
  setValue,
}: UseFormReturn<RegisterForm>) => {
  const cep = useWatch({ control, name: 'cep' }).replace(/\D/g, '');
  const [result, setResult] = useState<{
    cep: string;
    schools: RegistrationSchool[];
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setResult(null);
    setError('');
    setValue('city', '');
    setValue('state', '');
    setValue('schoolId', '');
    setLoading(cep.length === 8);
    if (cep.length !== 8) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const address = await getAdressByZipCode(cep);
        if (!active) {
          return;
        }
        setValue('city', address.localidade, { shouldValidate: true });
        setValue('state', address.uf, { shouldValidate: true });
        const schools = await registrationService.schools(
          address.localidade,
          address.uf,
        );
        if (active) {
          setResult({ cep, schools });
        }
      } catch (cause) {
        if (active) {
          setError(
            getErrorMessage(
              cause,
              'Não foi possível consultar o CEP ou as escolas. Tente novamente.',
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cep, attempt, setValue]);
  return {
    schools: result?.cep === cep ? result.schools : [],
    ready: result?.cep === cep,
    loading,
    error,
    retry: () => setAttempt(value => value + 1),
  };
};
