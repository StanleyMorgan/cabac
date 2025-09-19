import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// FIX: Changed import for `WagmiProvider` from `wagmi` to `@wagmi/react` to resolve module export error.
import { WagmiProvider } from '@wagmi/react';
import { config } from './wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

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