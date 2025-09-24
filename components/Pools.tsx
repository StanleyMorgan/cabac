import React, { useState, useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { baseSepolia } from 'viem/chains';
// FIX: Imported `Abi` type to simplify contract call types and prevent TS errors.
import { formatUnits, type Abi } from 'viem';
import { POOLS_BY_CHAIN } from '../constants';
import { Pool } from '../types';
import { PoolTableRow } from './PoolTableRow';
import AddLiquidityCard from './AddLiquidityCard';
import RemoveLiquidityCard from './RemoveLiquidityCard';

// FIX: Define a simpler ABI containing only the 'balanceOf' function to reduce
// type complexity for the TypeScript compiler, which can help prevent the
// "Type instantiation is excessively deep" error with `useReadContracts`.
const BALANCE_OF_ABI = [
    {
        "inputs": [ { "name": "_owner", "type": "address" } ],
        "name": "balanceOf",
        "outputs": [ { "name": "balance", "type": "uint256" } ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Define a specific type for the contract call to prevent a "Type instantiation is excessively deep"
// error when using `useReadContracts` with a dynamically generated array.
// This helps TypeScript without having to loosen the ABI's type.
type Erc20BalanceOfCall = {
    address: `0x${string}`;
    // FIX: Using the generic `Abi` type widens the type of the ABI, reducing complexity for
    // the TypeScript compiler and preventing "Type instantiation excessively deep" errors.
    // The return type of `useReadContracts` will be less specific, but the existing
    // code already casts the result, so this is safe.
    abi: Abi;
    functionName: 'balanceOf';
    // FIX: Changed args to `readonly unknown[]` to reduce type complexity and prevent "Type instantiation is excessively deep" error.
    args: readonly unknown[];
    chainId: number;
};

const Pools: React.FC = () => {
    const { chainId, isConnected } = useAccount();
    const displayChainId = chainId || baseSepolia.id;

    const basePools = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const contractsToRead = useMemo((): readonly Erc20BalanceOfCall[] => {
        // FIX: Replaced `.flatMap()` with a `for...of` loop. This imperative approach is often
        // easier for the TypeScript compiler to analyze and helps break the complex type
        // inference cycle that was causing the "excessively deep" error.
        const calls: Erc20BalanceOfCall[] = [];
        for (const pool of basePools) {
            calls.push({
                address: pool.token0.address as `0x${string}`,
                abi: BALANCE_OF_ABI,
                functionName: 'balanceOf',
                // FIX: Added `as const` to the `args` array. This helps TypeScript infer the
                // narrowest possible type for the tuple, which is crucial for `useReadContracts`
                // to avoid deep type instantiation errors with dynamic contract arrays.
                args: [pool.address as `0x${string}`] as const,
                chainId: displayChainId,
            });
            calls.push({
                address: pool.token1.address as `0x${string}`,
                abi: BALANCE_OF_ABI,
                functionName: 'balanceOf',
                // FIX: Added `as const` to the `args` array. This helps TypeScript infer the
                // narrowest possible type for the tuple, which is crucial for `useReadContracts`
                // to avoid deep type instantiation errors with dynamic contract arrays.
                args: [pool.address as `0x${string}`] as const,
                chainId: displayChainId,
            });
        }
        return calls;
    }, [basePools, displayChainId]);

    const { data: balanceResults, isLoading: areBalancesLoading } = useReadContracts({
        // FIX: Removed `as any` cast. By simplifying the contract call types with `Abi`,
        // TypeScript can correctly infer the types without running into complexity limits.
        contracts: contractsToRead,
        query: { enabled: isConnected && basePools.length > 0 }
    });

    const poolsWithTVL = useMemo(() => {
        if (!balanceResults || balanceResults.length === 0) {
            return basePools;
        }

        return basePools.map((pool, index) => {
            const balance0Result = balanceResults[index * 2];
            const balance1Result = balanceResults[index * 2 + 1];

            const balance0 = balance0Result?.status === 'success' ? (balance0Result.result as bigint) : 0n;
            const balance1 = balance1Result?.status === 'success' ? (balance1Result.result as bigint) : 0n;

            // Assuming stablecoins are pegged to $1 for TVL calculation
            const tvl0 = parseFloat(formatUnits(balance0, pool.token0.decimals));
            const tvl1 = parseFloat(formatUnits(balance1, pool.token1.decimals));

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
        <div className="w-full max-w-2xl bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <h2 className="text-xl font-bold mb-4">Pools</h2>
            
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
    );
};

export default Pools;