// FIX: Import from '@wagmi/core' to avoid module resolution conflict with the filename 'wagmi.ts'.
import { createConfig, http } from '@wagmi/core';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = 'YOUR_PROJECT_ID'; // <-- REPLACE WITH YOUR WALLETCONNECT PROJECT ID

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