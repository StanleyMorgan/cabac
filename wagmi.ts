// FIX: This file was empty, causing "not a module" errors. It is now populated with
// the wagmi config and re-exports from the `wagmi` package to resolve module
// shadowing and provide a centralized configuration point.
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

// Re-export everything from wagmi package. This allows other files to import from
// 'wagmi' and have it resolve to this file, which then provides the exports from
// the actual wagmi package.
export * from 'wagmi';

const projectId = 'd2b8b9a2599fa688a26b4859f7b1651e'; // Example Project ID from your old config

export const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [mainnet, sepolia],
  ssr: false, 
});
