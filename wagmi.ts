// This file now exclusively handles the creation and export of the wagmi config.
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set in the environment variables.");
}

export const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [mainnet, sepolia],
  ssr: false, 
});