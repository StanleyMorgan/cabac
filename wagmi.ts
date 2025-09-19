import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia, celoSepolia } from 'wagmi/chains';
// FIX: Re-export necessary hooks and components from 'wagmi' to resolve module shadowing.
export { WagmiProvider, useAccount } from 'wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set in the environment variables.");
}

export const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [sepolia, baseSepolia, celoSepolia],
  ssr: false, 
});