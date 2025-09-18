// FIX: Import from '@wagmi/core' to avoid module resolution conflict with the filename 'wagmi.ts'.
import { createConfig, http } from '@wagmi/core';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    // NOTE: WalletConnect and Coinbase temporarily disabled to simplify dependencies and fix build.
    // walletConnect({ projectId, showQrModal: false }),
    // coinbaseWallet({ appName: 'Cabac DEX' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});