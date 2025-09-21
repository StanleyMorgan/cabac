import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { POOLS_BY_CHAIN } from '../constants';
import { Pool } from '../types';
import PoolListItem from './PoolListItem';
import AddLiquidityCard from './AddLiquidityCard';

const Pools: React.FC = () => {
    const { chainId } = useAccount();
    const displayChainId = chainId || baseSepolia.id;

    const availablePools = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

    if (selectedPool) {
        return <AddLiquidityCard pool={selectedPool} onBack={() => setSelectedPool(null)} />;
    }

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pools</h2>
            </div>
            {availablePools.length > 0 ? (
                <div className="space-y-3">
                    {availablePools.map((pool) => (
                        <PoolListItem key={pool.address} pool={pool} onSelect={() => setSelectedPool(pool)} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-brand-text-secondary py-8">
                    No pools available on this network.
                </div>
            )}
        </div>
    );
};

export default Pools;
