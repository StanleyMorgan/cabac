import React from 'react';
// FIX: Changed import from 'wagmi' to '@wagmi/react' to avoid module resolution conflict with the local wagmi.ts file.
import { useAccount } from '@wagmi/react';
import Header from './components/Header';
import SwapCard from './components/SwapCard';

const App: React.FC = () => {
  // FIX: Used '=' for destructuring assignment instead of 'of'.
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <SwapCard isWalletConnected={isConnected} />
      </main>
    </div>
  );
};

export default App;