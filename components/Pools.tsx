import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { POOLS_BY_CHAIN } from '../constants';
import PoolListItem from './PoolListItem';
import AddLiquidityCard from './AddLiquidityCard';
import type { Pool } from '../types';

const Pools: React.FC = () => {
  const { chainId, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const availablePools = useMemo(() => {
    if (!chainId) return [];
    return POOLS_BY_CHAIN[chainId as keyof typeof POOLS_BY_CHAIN] || [];
  }, [chainId]);

  if (selectedPool) {
    return <AddLiquidityCard pool={selectedPool} onBack={() => setSelectedPool(null)} />;
  }
  
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center text-brand-text-secondary">
          Please connect your wallet to view pools.
        </div>
      );
    }
    
    if (availablePools.length === 0) {
        return (
            <div className="text-center text-brand-text-secondary">
                No pools available for the connected network.
            </div>
        )
    }

    return (
      <ul>
        {availablePools.map((pool) => (
          <PoolListItem key={pool.address} pool={pool} onSelect={setSelectedPool} />
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pools</h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default Pools;
