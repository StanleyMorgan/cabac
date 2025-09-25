import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors'

// 1. Get projectId at https://cloud.walletconnect.com
if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set')
}
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!import.meta.env.VITE_ALCHEMY_API_KEY) {
    throw new Error('VITE_ALCHEMY_API_KEY is not set in .env file');
}
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;


// 2. Create wagmiConfig
const metadata = {
  name: 'Cabac Swap',
  description: 'A simple and efficient token swap application.',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const config = createConfig({
  chains: [sepolia, baseSepolia],
  connectors: [
    injected(),
    // walletConnect({ projectId, metadata, showQrModal: false }),
    // safe(),
  ],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
})

// 3. Create a QueryClient
const queryClient = new QueryClient();

// 4. Create AppProviders component
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};