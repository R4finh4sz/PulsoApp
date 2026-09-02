import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

import { handleSuccess } from '@/utils/handleError';

export const useUpdate = () => {
  const [isLoading, setIsLoadingUpdate] = useState(false);

  useEffect(() => {
    const update = async () => {
      if (__DEV__) {
        return;
      }

      try {
        setIsLoadingUpdate(true);
        const { isAvailable } = await Updates.checkForUpdateAsync();

        if (isAvailable) {
          handleSuccess('Aplicativo Atualizando');
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      } finally {
        setIsLoadingUpdate(false);
      }
    };

    update();
  }, []);

  return isLoading;
};
