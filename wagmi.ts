// FIX: Import from '@wagmi/core' to avoid module resolution conflict with the filename 'wagmi.ts'.
import { createConfig, http } from '@wagmi/core';
import { mainnet, sepolia } from 'viem/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = 'd2b8b9a2599fa688a26b4859f7b1651e'; // Example Project ID

if (!projectId) {
  console.warn("WalletConnect projectId is not set. WalletConnect will not function.");
}


export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId, showQrModal: true }),
    coinbaseWallet({ appName: 'Cabac DEX' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
