import React, { useState } from 'react';
// FIX: Import 'useAccount' from '@wagmi/react' to avoid module resolution issues.
import { useAccount } from '@wagmi/react';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import WalletModal from './components/WalletModal';

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header
        isWalletConnected={isConnected}
        userAddress={address ?? null}
        onConnectWallet={() => setIsWalletModalOpen(true)}
      />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <SwapCard isWalletConnected={isConnected} onConnectWallet={() => setIsWalletModalOpen(true)} />
      </main>
      {isWalletModalOpen && (
        <WalletModal
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;