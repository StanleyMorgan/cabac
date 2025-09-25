import React from 'react';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet } from 'viem/chains'; // ← Начните с одной простой сети
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ВРЕМЕННО: Уберите AppKit полностью для теста
// import { createAppKit } from '@reown/appkit/react';
// import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

console.log("providers.tsx: Module loading...");

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

if (!projectId || !alchemyApiKey) {
    throw new Error('Missing required environment variables');
}

// 1. Создайте простой wagmi config без AppKit
const wagmiConfig = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    },
});

const queryClient = new QueryClient();

// 2. ВРЕМЕННО закомментируйте AppKit инициализацию
/*
try {
    console.log("Attempting to initialize AppKit...");
    const wagmiAdapter = new WagmiAdapter({
        projectId,
        networks: [mainnet],
        transports: {
            [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
        }
    });
    
    createAppKit({
        adapters: [wagmiAdapter],
        metadata: {
            name: 'Cabac',
            description: 'A decentralized exchange (DEX) interface for swapping tokens.',
            url: 'https://cabac.netlify.app',
            icons: ['https://cabac.netlify.app/favicon.ico'],
        }
    } as any);
    console.log("AppKit initialized successfully");
} catch (error) {
    console.error("AppKit initialization failed:", error);
}
*/

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