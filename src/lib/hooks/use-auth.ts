'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { publicKey, connected, connecting } = useWallet();
  const address = publicKey?.toBase58();

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
    enabled: !!address && connected,
  });

  return {
    address,
    isConnected: connected,
    isConnecting: connecting,
    user,
    isLoading: connecting || isLoadingUser,
  };
}
