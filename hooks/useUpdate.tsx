import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

import { handleSuccess } from '@/utils/handleError';

const useUpdate = () => {
  const [isLoading, setIsLoadingUpdate] = useState(false);
  useEffect(() => {
    const update = async () => {
      if (!__DEV__) {
        setIsLoadingUpdate(true);
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) {
          handleSuccess('Aplicativo Atualizando');
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
      setIsLoadingUpdate(false);
    };
    update();
  }, []);

  return isLoading;
};

export default useUpdate;
