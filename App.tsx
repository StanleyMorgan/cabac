
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import WalletModal from './components/WalletModal';

const App: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const connectWallet = useCallback(() => {
    // Simulate wallet connection
    const mockAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setUserAddress(mockAddress);
    setIsWalletConnected(true);
    setIsWalletModalOpen(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setUserAddress(null);
    setIsWalletConnected(false);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header
        isWalletConnected={isWalletConnected}
        userAddress={userAddress}
        onConnectWallet={() => setIsWalletModalOpen(true)}
        onDisconnectWallet={disconnectWallet}
      />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <SwapCard isWalletConnected={isWalletConnected} onConnectWallet={() => setIsWalletModalOpen(true)} />
      </main>
      {isWalletModalOpen && (
        <WalletModal
          onClose={() => setIsWalletModalOpen(false)}
          onConnect={connectWallet}
        />
      )}
    </div>
  );
};

export default App;
