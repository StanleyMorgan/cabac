import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import Pools from './components/Pools';

const App: React.FC = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');

  const getTabClass = (tabName: 'swap' | 'pool') => {
    return `px-6 py-2 rounded-lg text-base font-semibold transition-colors ${
      activeTab === tabName
        ? 'bg-brand-primary text-white'
        : 'text-brand-text-secondary hover:bg-brand-secondary'
    }`;
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-surface-2 p-1 rounded-xl flex space-x-1" role="tablist" aria-label="Swap or Pool">
            <button
              onClick={() => setActiveTab('swap')}
              className={getTabClass('swap')}
              role="tab"
              aria-selected={activeTab === 'swap'}
              aria-controls="swap-panel"
              id="swap-tab"
            >
              Swap
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={getTabClass('pool')}
              role="tab"
              aria-selected={activeTab === 'pool'}
              aria-controls="pool-panel"
              id="pool-tab"
            >
              Pool
            </button>
          </div>
        </div>
        
        <div id="swap-panel" role="tabpanel" aria-labelledby="swap-tab" hidden={activeTab !== 'swap'}>
           {activeTab === 'swap' && <SwapCard isWalletConnected={isConnected} />}
        </div>
         <div id="pool-panel" role="tabpanel" aria-labelledby="pool-tab" hidden={activeTab !== 'pool'}>
           {activeTab === 'pool' && <Pools />}
        </div>
      </main>
    </div>
  );
};

export default App;