import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import Pools from './components/Pools';

const App: React.FC = () => {
  const { isConnected } = useAccount();
  // State to track the current browser path
  const [pathname, setPathname] = useState(window.location.pathname);

  // Function to handle navigation without a full page reload
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const getTabClass = (path: '/swap' | '/pool') => {
    // Treat the root path "/" as the "/swap" path for styling
    const currentPath = pathname === '/' ? '/swap' : pathname;
    const isActive = currentPath === path;
    
    return `px-6 py-2 rounded-lg text-base font-semibold transition-colors ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-brand-text-secondary hover:bg-brand-secondary'
    }`;
  };

  const renderContent = () => {
    const currentPath = pathname === '/' ? '/swap' : pathname;

    switch (currentPath) {
      case '/swap':
        return <SwapCard isWalletConnected={isConnected} />;
      case '/pool':
        return <Pools />;
      default:
        // Redirect to swap for any unknown paths
        return <SwapCard isWalletConnected={isConnected} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Header />
      <main className="flex flex-col items-center justify-start pt-24 pb-12 px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-surface-2 p-1 rounded-xl flex space-x-1" role="tablist" aria-label="Swap or Pool">
            <button
              onClick={() => navigate('/swap')}
              className={getTabClass('/swap')}
              role="tab"
              aria-selected={pathname === '/swap' || pathname === '/'}
            >
              Swap
            </button>
            <button
              onClick={() => navigate('/pool')}
              className={getTabClass('/pool')}
              role="tab"
              aria-selected={pathname === '/pool'}
            >
              Pool
            </button>
          </div>
        </div>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
