import React from 'react';
import { WagmiProvider, http } from 'wagmi';
import { sepolia, baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

console.log("providers.tsx: Module loading...");

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

console.log(`providers.tsx: Checking for environment variables...`);
console.log(`providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is ${projectId ? 'found' : 'MISSING'}.`);
console.log(`providers.tsx: VITE_ALCHEMY_API_KEY is ${alchemyApiKey ? 'found' : 'MISSING'}.`);

if (!projectId || !alchemyApiKey) {
    console.error("providers.tsx: CRITICAL ERROR - One or more environment variables are not set. The application cannot start.");
    throw new Error('Missing required environment variables. Check the console for details.');
}

// 1. Create a QueryClient instance. This is required for TanStack Query to work.
const queryClient = new QueryClient();

// 2. Create the wagmi adapter
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [sepolia, baseSepolia],
    transports: {
        [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
        [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    }
});

// 3. Create the AppKit instance
createAppKit({
    adapters: [wagmiAdapter],
    metadata: {
        name: 'Cabac',
        description: 'A decentralized exchange (DEX) interface for swapping tokens.',
        url: 'https://cabac.netlify.app',
        icons: ['https://cabac.netlify.app/favicon.ico'],
    }
} as any); // Workaround for type issues

// 4. Get the wagmiConfig from the adapter
const wagmiConfig = wagmiAdapter.wagmiConfig;

// 5. AppProviders must include both WagmiProvider and QueryClientProvider.
// Wagmi hooks depend on the context provided by both to function correctly.
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    console.log("providers.tsx: Rendering AppProviders component.");
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};

console.log("providers.tsx: Module loaded successfully.");