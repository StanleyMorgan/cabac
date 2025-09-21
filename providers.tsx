import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
// FIX: Import QueryClient from @tanstack/query-core to resolve export issue.
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { sepolia, baseSepolia, celoSepolia as viemCeloSepolia } from 'viem/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set");
}

const celoSepolia = {
  ...viemCeloSepolia,
  iconUrl: 'https://celoscan.io/assets/celo/images/svg/logos/token-light.svg',
};

const config = getDefaultConfig({
  appName: 'Cabac DEX',
  projectId: projectId,
  chains: [sepolia, baseSepolia, celoSepolia],
  ssr: false, 
});

const queryClient = new QueryClient();

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