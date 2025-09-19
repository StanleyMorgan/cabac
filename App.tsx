import React from 'react';
// Fix: Import `useAccount` from '@wagmi/react' to resolve module export error.
import { useAccount } from '@wagmi/react';
import Header from './components/Header';
import SwapCard from './components/SwapCard';

const App: React.FC = () => {
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