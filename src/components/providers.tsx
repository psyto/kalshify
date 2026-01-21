'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/session-provider';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}
