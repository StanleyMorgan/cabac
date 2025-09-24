import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { POOLS_BY_CHAIN } from '../constants';
import { Pool } from '../types';
import PoolTableRow from './PoolTableRow';
import AddLiquidityCard from './AddLiquidityCard';
import RemoveLiquidityCard from './RemoveLiquidityCard';

const Pools: React.FC = () => {
    const { chainId, isConnected } = useAccount();
    const displayChainId = chainId || baseSepolia.id;

    const availablePools = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const [view, setView] = useState<'list' | 'add' | 'remove'>('list');
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

    const handleSelectPoolToAdd = (pool: Pool) => {
        setSelectedPool(pool);
        setView('add');
    };

    const handleSelectPoolToRemove = (pool: Pool) => {
        setSelectedPool(pool);
        setView('remove');
    };

    const handleBack = () => {
        setSelectedPool(null);
        setView('list');
    };
    
    const handleAddLiquidityClick = () => {
        if (availablePools.length > 0) {
            handleSelectPoolToAdd(availablePools[0]);
        }
    };

    if (view === 'add' && selectedPool) {
        return <AddLiquidityCard pool={selectedPool} onBack={handleBack} />;
    }
    
    if (view === 'remove' && selectedPool) {
        return <RemoveLiquidityCard pool={selectedPool} onBack={handleBack} />;
    }

    return (
        <div className="w-full max-w-2xl bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pools</h2>
                <button 
                    onClick={handleAddLiquidityClick}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    + Add Liquidity
                </button>
            </div>
            {availablePools.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-brand-text-secondary uppercase bg-brand-surface-2">
                            <tr>
                                <th scope="col" className="p-4 text-left font-semibold">Pair</th>
                                <th scope="col" className="p-4 text-right font-semibold">TVL</th>
                                <th scope="col" className="p-4 text-right font-semibold">My Liquidity</th>
                                <th scope="col" className="p-4 text-right font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {availablePools.map((pool) => (
                                <PoolTableRow 
                                    key={pool.address} 
                                    pool={pool} 
                                    onAdd={() => handleSelectPoolToAdd(pool)} 
                                    onRemove={() => handleSelectPoolToRemove(pool)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-brand-text-secondary py-8">
                    {isConnected ? 'No pools available on this network.' : 'Connect your wallet to see pools.'}
                </div>
            )}
        </div>
    );
};

export default Pools;
