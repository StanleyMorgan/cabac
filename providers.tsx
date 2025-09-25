import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@reown/appkit/react';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
if (!alchemyApiKey) {
    throw new Error('VITE_ALCHEMY_API_KEY is not set');
}

const config = createConfig({
  chains: [sepolia, baseSepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
  ssr: true, // Enable SSR for frameworks like Next.js
});

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider
          config={config}
          projectId={projectId}
        >
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
