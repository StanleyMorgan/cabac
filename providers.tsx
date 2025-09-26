import React from 'react';
import { WagmiProvider, http, type Config } from 'wagmi';
import { sepolia, baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

console.log("providers.tsx: Module loading...");

// Declare config and client outside the try block to make them accessible
// in the AppProviders component. We'll show an error component if they fail to initialize.
let wagmiConfig: Config | undefined;
let queryClient: QueryClient | undefined;
let initializationError: Error | null = null;

try {
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

    console.log("providers.tsx: Checking for environment variables...");
    if (projectId) {
        console.log("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is found.");
    } else {
        const errorMessage = "VITE_WALLETCONNECT_PROJECT_ID is MISSING. Please check your environment variables.";
        console.error(`providers.tsx: ${errorMessage}`);
        throw new Error(errorMessage);
    }

    if (alchemyApiKey) {
        console.log("providers.tsx: VITE_ALCHEMY_API_KEY is found.");
    } else {
        const errorMessage = "VITE_ALCHEMY_API_KEY is MISSING. Please check your environment variables.";
        console.error(`providers.tsx: ${errorMessage}`);
        throw new Error(errorMessage);
    }

    queryClient = new QueryClient();

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

    wagmiConfig = wagmiAdapter.wagmiConfig;
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
} catch (e: any) {
    initializationError = e;
    console.error("providers.tsx: A critical error occurred during initialization:", e);
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
        // This should not happen if there's no error, but it's a good safeguard.
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
