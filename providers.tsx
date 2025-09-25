import React from 'react';
// Импортируем createConfig и http для настройки RPC-провайдера
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import type { Chain } from 'viem';

// 1. Получаем projectId из https://cloud.walletconnect.com
if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set')
}
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// 2. Получаем Alchemy API Key
if (!import.meta.env.VITE_ALCHEMY_API_KEY) {
    throw new Error('VITE_ALCHEMY_API_KEY is not set. Please add it to your environment variables.');
}
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

// Определяем метаданные для модального окна WalletConnect
const metadata = {
  name: 'Cabac Swap',
  description: 'A simple and efficient token swap application.',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Определяем поддерживаемые сети
const networks: [Chain, ...Chain[]] = [sepolia, baseSepolia];

// Создаем экземпляр адаптера Wagmi для Reown AppKit
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

// Получаем конфигурацию, сгенерированную адаптером (включает коннекторы для WalletConnect)
const originalConfig = wagmiAdapter.wagmiConfig;

// Создаем новую конфигурацию wagmi, которая использует коннекторы адаптера,
// но переопределяет транспорты для использования надежного RPC от Alchemy.
const config = createConfig({
    chains: networks,
    // Используем коннекторы из адаптера, чтобы обеспечить работу WalletConnect
    connectors: originalConfig.connectors,
    // Указываем транспорты Alchemy для надежного получения данных
    transports: {
        [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
        [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    },
});

// Инициализируем AppKit глобально. Это регистрирует веб-компонент <appkit-button />.
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  defaultNetwork: baseSepolia,
});

// Создаем QueryClient для react-query
const queryClient = new QueryClient();

// Создаем основной компонент AppProviders
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // Используем НОВУЮ конфигурацию с RPC от Alchemy
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};