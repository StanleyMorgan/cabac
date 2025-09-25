import React from 'react';
// Импортируем createConfig и http для настройки RPC-провайдера
import { WagmiProvider, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import type { Chain } from 'viem';

// --- DEBUG LOGGING ---
console.groupCollapsed('%c[providers.tsx] AppKit & Wagmi Configuration', 'color: #ffa500; font-weight: bold;');
console.log("providers.tsx: Script loading...");

// 1. Получаем projectId из https://cloud.walletconnect.com
if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    console.error("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is not set! This is a critical error.");
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set')
}
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
console.log("providers.tsx: WalletConnect Project ID:", projectId);


// 2. Получаем Alchemy API Key
if (!import.meta.env.VITE_ALCHEMY_API_KEY) {
    console.error("providers.tsx: VITE_ALCHEMY_API_KEY is not set! This is a critical error.");
    throw new Error('VITE_ALCHEMY_API_KEY is not set. Please add it to your environment variables.');
}
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
console.log("providers.tsx: Alchemy API Key is set (value hidden for security).");

const metadata = {
  name: 'Cabac Swap',
  description: 'A simple and efficient token swap application.',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const networks: [Chain, ...Chain[]] = [sepolia, baseSepolia];
console.log("providers.tsx: Supported Networks:", networks.map(n => n.name));

const transports = {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
};
console.log("providers.tsx: Alchemy transports configured for chains:", Object.keys(transports));

console.log("providers.tsx: Creating WagmiAdapter with the following config:", { projectId, networks, transports: '...' });
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports,
});

const config = wagmiAdapter.wagmiConfig;
console.log("providers.tsx: Wagmi config obtained from adapter. This config will be used by WagmiProvider and AppKit:", config);

console.log("providers.tsx: Initializing AppKit globally...");
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  defaultNetwork: baseSepolia,
});
console.log("providers.tsx: AppKit initialized.");

const queryClient = new QueryClient();
console.log("providers.tsx: QueryClient created.");
console.groupEnd();
// --- END DEBUG LOGGING ---

// ErrorBoundary для отладки ошибок рендеринга
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error: Error) {
      console.error("ErrorBoundary: getDerivedStateFromError caught an error:", error);
      return { hasError: true, error };
    }
  
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error("ErrorBoundary: componentDidCatch caught an error:", error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return (
            <div style={{ color: 'white', backgroundColor: '#0D111C', padding: '20px', fontFamily: 'monospace', minHeight: '100vh' }}>
                <h1 style={{color: '#FF4B4B'}}>Application Error</h1>
                <p>An error occurred during rendering. Check the browser console for more details.</p>
                <pre style={{ color: '#F0F0F0', marginTop: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {this.state.error?.toString()}
                    <br /><br />
                    {this.state.error?.stack}
                </pre>
            </div>
        );
      }
  
      return this.props.children;
    }
}

// Создаем основной компонент AppProviders
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("%c[providers.tsx] AppProviders rendering with WagmiProvider...", 'color: #lightblue;');
  return (
    // Используем конфигурацию от адаптера с RPC от Alchemy
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
console.log("providers.tsx: Script loaded successfully.");