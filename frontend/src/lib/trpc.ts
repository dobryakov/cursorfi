import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers/trpc';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''; // Browser: use relative URL
  }
  return process.env.CURSORFI_BACKEND_URL || 'http://backend:4001';
};

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

