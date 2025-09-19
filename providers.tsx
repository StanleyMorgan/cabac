import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// FIX: Changed to a namespace import to fix module resolution issues.
import * as wagmi from 'wagmi';
import { config } from './wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <wagmi.WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </wagmi.WagmiProvider>
  );
};
