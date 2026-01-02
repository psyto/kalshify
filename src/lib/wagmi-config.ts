import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, polygon, optimism } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Fabrknt Match',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, base, polygon, optimism],
  ssr: true, // Enable server-side rendering support
});
