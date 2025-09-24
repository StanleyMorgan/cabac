import React, { useState, useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { formatUnits } from 'viem';
import { POOLS_BY_CHAIN } from '../constants';
import { Pool } from '../types';
import PoolTableRow from './PoolTableRow';
import AddLiquidityCard from './AddLiquidityCard';
import RemoveLiquidityCard from './RemoveLiquidityCard';
import { ERC20_ABI } from '../config';

const Pools: React.FC = () => {
    const { chainId, isConnected } = useAccount();
    const displayChainId = chainId || baseSepolia.id;

    const availablePools = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const contractsToRead = useMemo(() => {
        return availablePools.flatMap(pool => ([
            {
                address: pool.token0.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [pool.address as `0x${string}`],
                chainId: displayChainId,
            },
            {
                address: pool.token1.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [pool.address as `0x${string}`],
                chainId: displayChainId,
            }
        ]));
    }, [availablePools, displayChainId]);

    const { data: poolBalances, isLoading: areBalancesLoading } = useReadContracts({
        contracts: contractsToRead,
        query: { enabled: isConnected && availablePools.length > 0 }
    });

    const poolsWithCalculatedTVL = useMemo(() => {
        return availablePools.map((pool, index) => {
            if (!poolBalances || poolBalances.length === 0) {
                return pool;
            }

            const token0BalanceResult = poolBalances[index * 2];
            const token1BalanceResult = poolBalances[index * 2 + 1];

            let calculatedTvl = 0;
            const stablecoins = ['USDT', 'USDC', 'USDE'];

            if (token0BalanceResult?.status === 'success' && stablecoins.includes(pool.token0.symbol)) {
                const balance = formatUnits(token0BalanceResult.result as bigint, pool.token0.decimals);
                calculatedTvl += parseFloat(balance);
            }

            if (token1BalanceResult?.status === 'success' && stablecoins.includes(pool.token1.symbol)) {
                const balance = formatUnits(token1BalanceResult.result as bigint, pool.token1.decimals);
                calculatedTvl += parseFloat(balance);
            }
            
            // For pools with non-stablecoins, we can't accurately calculate TVL with the $1 assumption,
            // so we keep the mocked value if our calculation is zero.
            const finalTvl = calculatedTvl > 0 ? calculatedTvl : pool.tvl;

            return { ...pool, tvl: finalTvl };
        });
    }, [availablePools, poolBalances]);


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

    const isLoading = isConnected && areBalancesLoading && poolsWithCalculatedTVL.length > 0;

    return (
        <div className="w-full max-w-2xl bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <h2 className="text-xl font-bold mb-4">Pools</h2>
            
            {(isConnected && availablePools.length > 0) || !isConnected ? (
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
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <PoolTableRow key={i} isLoading={true} />
                                ))
                            ) : (
                                poolsWithCalculatedTVL.map((pool) => (
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
    );
};

export default Pools;