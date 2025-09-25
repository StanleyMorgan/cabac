import React from 'react';
import { WagmiProvider, http } from 'wagmi';
import { sepolia, baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

console.log("providers.tsx: Module loading...");

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

console.log("providers.tsx: Checking for environment variables...");
if (projectId) {
    console.log("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is found.");
} else {
    console.error("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is MISSING.");
}

if (alchemyApiKey) {
    console.log("providers.tsx: VITE_ALCHEMY_API_KEY is found.");
} else {
    console.error("providers.tsx: VITE_ALCHEMY_API_KEY is MISSING.");
}


if (!projectId || !alchemyApiKey) {
    throw new Error('Missing required environment variables');
}

const queryClient = new QueryClient();

// Create the adapter
const wagmiAdapter = new WagmiAdapter({
    projectId,
    // The adapter expects 'networks'
    networks: [sepolia, baseSepolia],
    transports: {
        [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
        [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    }
});

const wagmiConfig = wagmiAdapter.wagmiConfig;
console.log("providers.tsx: wagmiConfig created:", wagmiConfig);

// Create the AppKit instance
createAppKit({
    adapters: [wagmiAdapter],
    metadata: {
        name: 'Cabac',
        description: 'A decentralized exchange (DEX) interface for swapping tokens.',
        url: 'https://cabac.netlify.app',
        icons: ['https://cabac.netlify.app/favicon.ico'],
    }
} as any);
console.log("providers.tsx: AppKit initialized.");


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
