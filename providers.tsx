import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia as sepoliaBase, baseSepolia as baseSepoliaBase } from 'viem/chains';
import type { Chain } from 'viem';

// 1. Get Project ID and Alchemy Key from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set in .env");
}
if (!alchemyApiKey) {
    throw new Error("VITE_ALCHEMY_API_KEY is not set in .env");
}

// Manually configure chains with our Alchemy RPC endpoints for reliable data fetching
const sepolia: Chain = {
    ...sepoliaBase,
    rpcUrls: {
        ...sepoliaBase.rpcUrls,
        default: {
            http: [`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`],
        },
    }
};

const baseSepolia: Chain = {
    ...baseSepoliaBase,
    rpcUrls: {
        ...baseSepoliaBase.rpcUrls,
        default: {
            http: [`https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`],
        },
    }
};

// Celo Sepolia is not in the default exports, so we define it manually.
const celoSepolia: Chain = {
  id: 44787,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.celo.org/api'] },
  },
  blockExplorers: {
    default: { name: 'Celoscan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
};

// 2. Define supported networks
const networks: [Chain, ...Chain[]] = [sepolia, baseSepolia, celoSepolia];

// 3. Create the Wagmi adapter instance
// For Vite/CSR, we can use wagmi's default storage and disable SSR.
const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks,
});

// 4. Define app metadata
const metadata = {
  name: 'Cabac DEX',
  description: 'A decentralized exchange (DEX) interface for swapping tokens.',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`], // Assuming a favicon exists
};

// 5. Initialize AppKit outside the component render cycle
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: baseSepolia,
  metadata,
  features: { analytics: true },
});

// Create a React Query client
const queryClient = new QueryClient();

// 6. Create the context provider component
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  // Wagmi config is now available from the adapter
  const config = wagmiAdapter.wagmiConfig;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};