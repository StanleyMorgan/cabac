import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// FIX: Update imports to use the local wagmi.ts module.
// FIX: Import `WagmiProvider` directly from 'wagmi' to avoid a module name collision with the local `wagmi.ts` file.
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';
// FIX: Import config from the new wagmi.ts module.
import { config } from './wagmi';

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