import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { formatUnits } from 'viem';
import { POOLS_BY_CHAIN } from '../constants';
import { Pool } from '../types';
import { PoolTableRow } from './PoolTableRow';
import AddLiquidityCard from './AddLiquidityCard';
import RemoveLiquidityCard from './RemoveLiquidityCard';
import { RefreshIcon } from './icons/RefreshIcon';
import MyPositions from './MyPositions';

const minimalBalanceOfAbi = [
    {
        "inputs": [ { "name": "_owner", "type": "address" } ],
        "name": "balanceOf",
        "outputs": [ { "name": "balance", "type": "uint256" } ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

const Pools: React.FC = () => {
    const { isConnected, chain } = useAccount();
    const chainId = chain?.id;
    
    const displayChainId = chainId || baseSepolia.id;
    
    const publicClient = usePublicClient({ chainId: displayChainId });

    const basePools = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const [balanceResults, setBalanceResults] = useState<(bigint | undefined)[]>([]);
    const [areBalancesLoading, setAreBalancesLoading] = useState(false);
    const [areBalancesFetching, setAreBalancesFetching] = useState(false);

    const fetchBalances = useCallback(async () => {
        if (!publicClient || !isConnected || basePools.length === 0) return;
        setAreBalancesFetching(true);
        try {
            // Fix: Add `as const` to help with TypeScript type inference for multicall
            const contractsToRead = basePools.flatMap((pool) => [
                {
                    address: pool.token0.address as `0x${string}`,
                    abi: minimalBalanceOfAbi,
                    functionName: 'balanceOf',
                    args: [pool.address as `0x${string}`],
                } as const,
                {
                    address: pool.token1.address as `0x${string}`,
                    abi: minimalBalanceOfAbi,
                    functionName: 'balanceOf',
                    args: [pool.address as `0x${string}`],
                } as const,
            ]);

            const results = await publicClient.multicall({
                contracts: contractsToRead,
            });

            setBalanceResults(results.map(r => r.status === 'success' ? r.result as bigint : undefined));
        } catch (e) {
            console.error("Failed to fetch pool balances", e);
            setBalanceResults([]);
        } finally {
            setAreBalancesFetching(false);
        }
    }, [publicClient, isConnected, basePools]);

    useEffect(() => {
        setAreBalancesLoading(true);
        fetchBalances().finally(() => setAreBalancesLoading(false));
    }, [fetchBalances]);

    const handleRefresh = useCallback(() => {
        if (areBalancesFetching) return;
        fetchBalances();
    }, [areBalancesFetching, fetchBalances]);

    const poolsWithTVL = useMemo(() => {
        if (!balanceResults || balanceResults.length === 0) {
            return basePools;
        }

        return basePools.map((pool, index) => {
            const balance0 = balanceResults[index * 2];
            const balance1 = balanceResults[index * 2 + 1];

            const tvl0 = balance0 ? parseFloat(formatUnits(balance0, pool.token0.decimals)) : 0;
            const tvl1 = balance1 ? parseFloat(formatUnits(balance1, pool.token1.decimals)) : 0;

            return {
                ...pool,
                tvl: tvl0 + tvl1,
            };
        });
    }, [basePools, balanceResults]);

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
    
    if (view === 'add' && selectedPool) {
        return <AddLiquidityCard pool={selectedPool} onBack={handleBack} />;
    }
    
    if (view === 'remove' && selectedPool) {
        return <RemoveLiquidityCard pool={selectedPool} onBack={handleBack} />;
    }

    return (
        <div className="w-full max-w-2xl space-y-6">
            <MyPositions />
            <div className="bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">All Pools</h2>
                    <button 
                        onClick={handleRefresh} 
                        disabled={areBalancesFetching} 
                        className="text-brand-text-secondary hover:text-brand-text-primary transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Refresh pool data"
                    >
                        <RefreshIcon className={`w-5 h-5 ${areBalancesFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                
                {basePools.length > 0 ? (
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
                                {(areBalancesLoading && isConnected) ? (
                                    basePools.map((pool) => (
                                        <PoolTableRow 
                                            key={pool.address} 
                                            pool={pool}
                                            isLoading={true}
                                            onAdd={() => {}} 
                                            onRemove={() => {}}
                                        />
                                    ))
                                ) : (
                                    poolsWithTVL.map((pool) => (
                                        <PoolTableRow 
                                            key={pool.address} 
                                            pool={pool} 
                                            onAdd={() => handleSelectPoolToAdd(pool)} 
                                            onRemove={() => handleSelectPoolToRemove(pool)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-brand-text-secondary py-8">
                        {isConnected ? 'No pools available on this network.' : 'Connect your wallet to see pools.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pools;
