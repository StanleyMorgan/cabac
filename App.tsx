import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import Pools from './components/Pools';

const App: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [activeTab, setActiveTab] = useState<'swap' | 'pools'>('swap');

  // --- DEBUG LOGGING ---
  // Добавляем хук useBalance здесь, чтобы проверить нативный баланс на верхнем уровне приложения.
  // Это "источник правды" для сравнения с тем, что показывает AppKit.
  const { data: nativeBalance, isSuccess } = useBalance({ address, chainId });

  useEffect(() => {
    if (isConnected && isSuccess) {
      console.log(
        '%c[App.tsx] Native Balance Check:', 
        'color: #00ff00; font-weight: bold;', 
        {
          formatted: nativeBalance.formatted,
          symbol: nativeBalance.symbol,
          value: nativeBalance.value.toString(),
        }
      );
    } else if (isConnected && !isSuccess) {
        console.warn('[App.tsx] Native Balance Hook: Connected, but failed to fetch balance.');
    }
  }, [nativeBalance, isConnected, isSuccess]);
  // --- END DEBUG LOGGING ---

  useEffect(() => {
    console.log("App.tsx: Component successfully mounted.");
  }, []);

  const getTabClass = (tabName: 'swap' | 'pools') => {
    return activeTab === tabName
      ? 'bg-brand-primary text-white'
      : 'bg-brand-surface-2 text-brand-text-secondary hover:bg-brand-secondary';
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4 space-y-8">
        <div className="w-full max-w-md flex justify-center mb-0">
            <div className="bg-brand-surface p-1 rounded-xl flex space-x-1">
                 <button
                    onClick={() => setActiveTab('swap')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${getTabClass('swap')}`}
                >
                    Swap
                </button>
                <button
                    onClick={() => setActiveTab('pools')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${getTabClass('pools')}`}
                >
                    Pools
                </button>
            </div>
        </div>
        
        {activeTab === 'swap' && <SwapCard isWalletConnected={isConnected} />}
        {activeTab === 'pools' && <Pools />}
      </main>
    </div>
  );
};

export default App;