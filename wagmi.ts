// This file now exclusively handles the creation and export of the wagmi config.
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

const projectId = 'd2b8b9a2599fa688a26b4859f7b1651e'; // Example Project ID

export const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [mainnet, sepolia],
  ssr: false, 
});
