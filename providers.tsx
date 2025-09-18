import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// FIX: The import from 'wagmi' was failing because a local wagmi.ts file was shadowing the npm package.
// This is now fixed by importing from our local wagmi.ts file (via the 'wagmi' specifier) which
// now correctly provides the config and WagmiProvider.
import { WagmiProvider, config } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

// FIX: The wagmi configuration logic has been moved to the wagmi.ts file to
// centralize configuration and resolve module loading errors.

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
