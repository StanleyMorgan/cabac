import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia, celoSepolia } from 'wagmi/chains';

// FIX: Removed 'export * from "wagmi"' to avoid a module name collision with this file.
// Hooks and components should be imported directly from 'wagmi' package.

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