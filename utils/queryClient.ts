import { QueryClient } from '@tanstack/react-query';

import { handleError } from './handleError';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000,
      retry: false,
      initialDataUpdatedAt: 0,
    },
    mutations: {
      onError: err => handleError(err),
    },
  },
});

export default queryClient;
