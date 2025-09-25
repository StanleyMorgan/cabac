import React from 'react';
// Импортируем createConfig и http для настройки RPC-провайдера
import { WagmiProvider, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import type { Chain } from 'viem';

console.log("providers.tsx: Script loading...");

// 1. Получаем projectId из https://cloud.walletconnect.com
console.log("providers.tsx: Checking for VITE_WALLETCONNECT_PROJECT_ID...");
console.log("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID value:", import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);
if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    console.error("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID is not set! This is a critical error.");
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set')
}
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
console.log("providers.tsx: VITE_WALLETCONNECT_PROJECT_ID found.");


// 2. Получаем Alchemy API Key
console.log("providers.tsx: Checking for VITE_ALCHEMY_API_KEY...");
console.log("providers.tsx: VITE_ALCHEMY_API_KEY value:", import.meta.env.VITE_ALCHEMY_API_KEY);
if (!import.meta.env.VITE_ALCHEMY_API_KEY) {
    console.error("providers.tsx: VITE_ALCHEMY_API_KEY is not set! This is a critical error.");
    throw new Error('VITE_ALCHEMY_API_KEY is not set. Please add it to your environment variables.');
}
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
console.log("providers.tsx: VITE_ALCHEMY_API_KEY found.");

// Определяем метаданные для модального окна WalletConnect
const metadata = {
  name: 'Cabac Swap',
  description: 'A simple and efficient token swap application.',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Определяем поддерживаемые сети
const networks: [Chain, ...Chain[]] = [sepolia, baseSepolia];

// FIX: Pass custom transports directly to the WagmiAdapter.
// This ensures a single wagmi config is created and shared between AppKit and wagmi hooks,
// preventing state desynchronization and resolving the connector type error.
console.log("providers.tsx: Creating Alchemy transports...");
const transports = {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
};
console.log("providers.tsx: Transports created:", transports);

// Создаем экземпляр адаптера Wagmi для Reown AppKit, предоставляя кастомные транспорты
console.log("providers.tsx: Creating WagmiAdapter...");
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports,
});
console.log("providers.tsx: WagmiAdapter created.");

// Используем конфигурацию, сгенерированную адаптером, которая теперь включает наши кастомные транспорты
const config = wagmiAdapter.wagmiConfig;
console.log("providers.tsx: Wagmi config obtained from adapter:", config);


// Инициализируем AppKit глобально. Это регистрирует веб-компонент <appkit-button />.
console.log("providers.tsx: Creating AppKit...");
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  defaultNetwork: baseSepolia,
});
console.log("providers.tsx: AppKit created.");

// Создаем QueryClient для react-query
const queryClient = new QueryClient();
console.log("providers.tsx: QueryClient created.");

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
  console.log("providers.tsx: AppProviders component rendering...");
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