import React from 'react';
// FIX: Import useAccount from '@wagmi/react' directly to fix module resolution issue.
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