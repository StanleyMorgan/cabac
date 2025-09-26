import React from 'react';
import { WagmiProvider, http, type Config } from 'wagmi';
import { sepolia, baseSepolia } from 'viem/chains';
import { type Chain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

console.log("providers.tsx: Module loading...");

let wagmiConfig: Config | undefined;
let queryClient: QueryClient | undefined;
let initializationError: Error | null = null;

try {
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

    console.log("providers.tsx: Checking for environment variables...");
    if (!projectId) {
        throw new Error("VITE_WALLETCONNECT_PROJECT_ID is MISSING. Please check your environment variables.");
    }

    if (!alchemyApiKey) {
        throw new Error("VITE_ALCHEMY_API_KEY is MISSING. Please check your environment variables.");
    }

    console.log("providers.tsx: Environment variables found.");

    queryClient = new QueryClient();

    // ✅ ПРАВИЛЬНО: Создаем массив сетей
    const chains: [Chain, ...Chain[]] = [sepolia, baseSepolia];

    // ✅ ПРАВИЛЬНО: Создаем адаптер
    const wagmiAdapter = new WagmiAdapter({
        projectId,
        networks: chains,
        transports: {
            [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
            [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
        }
    });

    wagmiConfig = wagmiAdapter.wagmiConfig;
    console.log("providers.tsx: wagmiConfig created successfully");

    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: УБИРАЕМ networks параметр!
    createAppKit({
        adapters: [wagmiAdapter], // ← ВСЯ конфигурация уже в адаптере
        metadata: {
            name: 'Cabac',
            description: 'A decentralized exchange (DEX) interface for swapping tokens.',
            url: 'https://cabac.netlify.app',
            icons: ['https://cabac.netlify.app/favicon.ico'],
        }
    } as any); // ← Используем as any для обхода устаревших типов

    console.log("providers.tsx: AppKit initialized successfully");

} catch (e: any) {
    initializationError = e;
    console.error("providers.tsx: Initialization failed:", e);
}

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    console.log("providers.tsx: Rendering AppProviders component.");

    if (initializationError) {
        return (
            <div style={{ color: '#FF4B4B', padding: '2rem', backgroundColor: '#0D111C', fontFamily: 'monospace', height: '100vh', overflow: 'auto' }}>
                <h1>Application Initialization Failed</h1>
                <p style={{ color: '#F0F0F0' }}>{initializationError.message}</p>
                <pre style={{ color: '#A0A0A0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{initializationError.stack}</pre>
            </div>
        );
    }
    
    if (!wagmiConfig || !queryClient) {
        return (
            <div style={{ color: 'orange', padding: '2rem', backgroundColor: '#0D111C', height: '100vh' }}>
                <h1>Application is initializing...</h1>
                <p>If you see this for more than a few seconds, there might be an issue.</p>
            </div>
        );
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};