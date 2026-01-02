'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();

  // Fetch user profile from API (when backend is ready)
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null;

      try {
        const res = await fetch(`/api/users/${address}`);
        if (!res.ok) return null;
        return res.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!address && isConnected,
  });

  return {
    address,
    isConnected,
    isConnecting,
    user,
    isLoading: isConnecting || isLoadingUser,
  };
}
