import React from 'react';
import { WagmiProvider, http } from 'wagmi';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

if (!projectId || !alchemyApiKey) {
    throw new Error('Missing required environment variables');
}

// 1. Создаем адаптер (единственный источник конфигурации)
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [sepolia, baseSepolia],
    transports: {
        [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
        [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    }
});

// 2. Создаем AppKit (игнорируем устаревшие типы)
const appKit = createAppKit({
    adapters: [wagmiAdapter],
    metadata: {
        name: 'Cabac',
        description: 'A decentralized exchange (DEX) interface for swapping tokens.',
        url: 'https://cabac.netlify.app',
        icons: ['https://cabac.netlify.app/favicon.ico'],
    }
} as any); // ← Решение для обхода типов

// 3. Используем конфиг из адаптера
const wagmiConfig = wagmiAdapter.wagmiConfig;

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};