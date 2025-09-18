// FIX: Import from '@wagmi/core' to avoid module resolution conflict with the filename 'wagmi.ts'.
import { createConfig, http } from '@wagmi/core';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// TODO: Replace with your actual project ID from https://cloud.walletconnect.com
const projectId = 'cbaa2995b0f4736f87532b130f0f4b30';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId, showQrModal: false }),
    coinbaseWallet({ appName: 'Cabac DEX' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});