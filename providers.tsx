import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';
import { sepolia, baseSepolia, celoSepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set in the environment variables.");
}

const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId,
  chains: [sepolia, baseSepolia, celoSepolia],
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