import '@rainbow-me/rainbowkit/styles.css';
// FIX: Added getDefaultConfig to imports
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
// FIX: This import will now correctly resolve to the wagmi package
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';
// FIX: Added chains import for wagmi config
import { mainnet, sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

// FIX: Moved wagmi config creation from wagmi.ts to providers.tsx to avoid module resolution conflict.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set in the environment variables.");
}

const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [mainnet, sepolia],
  ssr: false, 
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
