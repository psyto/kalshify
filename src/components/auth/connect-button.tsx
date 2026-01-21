'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function AuthConnectButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="wallet-adapter-button-wrapper">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors" />
    </div>
  );
}

export function WalletAddress() {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  const address = publicKey.toBase58();
  return (
    <span className="text-sm text-zinc-500">
      {address.slice(0, 4)}...{address.slice(-4)}
    </span>
  );
}
