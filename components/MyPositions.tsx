import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI, POOL_ABI } from '../config';
import { POOLS_BY_CHAIN, TOKENS_BY_CHAIN } from '../constants';
import { Token, Pool } from '../types';
import { Pool as V3Pool, Position as V3Position } from '@uniswap/v3-sdk';
import { Token as V3Token } from '@uniswap/sdk-core';
import JSBI from 'jsbi';


export interface Position {
    id: bigint;
    token0: Token;
    token1: Token;
    fee: number;
    liquidity: bigint;
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    amount0Formatted: string;
    amount1Formatted: string;
}

interface MyPositionsProps {
    onIncrease: (position: Position) => void;
    onRemove: (position: Position) => void;
}

const MyPositions: React.FC<MyPositionsProps> = ({ onIncrease, onRemove }) => {
    const { address, isConnected, chain } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);
    const [burningPositionId, setBurningPositionId] = useState<bigint | null>(null);
    const [refetchCounter, setRefetchCounter] = useState(0);

    const tokensForChain = useMemo(() => {
        const tokenMap = new Map<string, Token>();
        if (chain) {
            TOKENS_BY_CHAIN[chain.id]?.forEach(token => {
                tokenMap.set(token.address.toLowerCase(), token);
            });
        }
        return tokenMap;
    }, [chain]);

    const poolLookup = useMemo(() => {
        const map = new Map<string, Pool>();
        if (chain) {
            const pools = POOLS_BY_CHAIN[chain.id] || [];
            pools.forEach(pool => {
                const [addr0, addr1] = [pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase()].sort();
                const key = `${addr0}-${addr1}-${pool.fee}`;
                map.set(key, pool);
            });
        }
        return map;
    }, [chain]);

    useEffect(() => {
        const fetchPositions = async () => {
            if (!publicClient || !address || !chain || !CONTRACT_ADDRESSES[chain.id]) {
                setPositions([]);
                return;
            };
            
            setIsLoading(true);
            try {
                const positionManagerAddress = CONTRACT_ADDRESSES[chain.id].POSITION_MANAGER;
                
                const balance = await publicClient.readContract({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'balanceOf',
                    args: [address],
                } as any);

                if (balance === BigInt(0)) {
                    setPositions([]);
                    return;
                }

                const tokenIdsCalls = Array.from({ length: Number(balance) }, (_, i) => ({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'tokenOfOwnerByIndex',
                    args: [address, BigInt(i)],
                }));

                const tokenIdsResults = await publicClient.multicall({ contracts: tokenIdsCalls } as any);
                const tokenIds = tokenIdsResults.filter(r => r.status === 'success').map(r => r.result as bigint);

                const positionsCalls = tokenIds.map(tokenId => ({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'positions',
                    args: [tokenId],
                }));
                
                const positionsResults = await publicClient.multicall({ contracts: positionsCalls } as any);

                const rawPositions = positionsResults
                    .map((r, i) => ({ result: r.result, tokenId: tokenIds[i] }))
                    .filter(item => item.result);

                const poolAddresses = [...new Set(rawPositions
                    .map(({ result: posData }) => {
                        const data = posData as any;
                        const token0Addr = (data[2] as string).toLowerCase();
                        const token1Addr = (data[3] as string).toLowerCase();
                        const fee = data[4];
                        const [sortedAddr0, sortedAddr1] = [token0Addr, token1Addr].sort();
                        const poolKey = `${sortedAddr0}-${sortedAddr1}-${fee}`;
                        return poolLookup.get(poolKey)?.address;
                    })
                    .filter((addr): addr is `0x${string}` => !!addr)
                )];

                const slot0Calls = poolAddresses.map(address => ({
                    address,
                    abi: POOL_ABI,
                    functionName: 'slot0'
                }));

                const liquidityCalls = poolAddresses.map(address => ({
                    address,
                    abi: POOL_ABI,
                    functionName: 'liquidity'
                }));
        
                const [slot0Results, liquidityResults] = await Promise.all([
                    slot0Calls.length > 0
                        ? publicClient.multicall({ contracts: slot0Calls } as any)
                        : Promise.resolve([]),
                    liquidityCalls.length > 0
                        ? publicClient.multicall({ contracts: liquidityCalls } as any)
                        : Promise.resolve([]),
                ]);

                const poolDataMap = new Map<string, { slot0: any; liquidity: any }>();
                poolAddresses.forEach((addr, i) => {
                    const slot0 = slot0Results[i]?.status === 'success' ? slot0Results[i].result : null;
                    const liquidity = liquidityResults[i]?.status === 'success' ? liquidityResults[i].result : null;

                    if (slot0 && liquidity !== null) {
                        poolDataMap.set(addr.toLowerCase(), { slot0, liquidity });
                    }
                });

                const fetchedPositions: Position[] = rawPositions
                    .map(item => {
                        const posData = item.result as any;
                        // FIX: Cast posData elements to `any` before calling `toLowerCase` to avoid type errors with `unknown`.
                        const token0Addr = (posData[2] as any).toLowerCase();
                        const token1Addr = (posData[3] as any).toLowerCase();
                        const fee = posData[4];
                        const tickLower = posData[5] as number;
                        const tickUpper = posData[6] as number;
                        const liquidity = posData[7] as bigint;

                        const token0 = tokensForChain.get(token0Addr);
                        const token1 = tokensForChain.get(token1Addr);
                        
                        const [sortedAddr0, sortedAddr1] = [token0Addr, token1Addr].sort();
                        const poolKey = `${sortedAddr0}-${sortedAddr1}-${fee}`;
                        const pool = poolLookup.get(poolKey);

                        if (!token0 || !token1 || !pool) return null;

                        let amount0Formatted = '0';
                        let amount1Formatted = '0';
                        const poolData = poolDataMap.get(pool.address.toLowerCase());

                        if (liquidity > 0n && poolData && chain) {
                            try {
                                const v3Token0 = new V3Token(chain.id, token0.address, token0.decimals, token0.symbol, token0.name);
                                const v3Token1 = new V3Token(chain.id, token1.address, token1.decimals, token1.symbol, token1.name);
                                
                                // FIX: Explicitly convert tick to a number, as the SDK expects a number, not a BigInt.
                                // This prevents the 'Convert JSBI instances to native numbers' error.
                                const tickCurrent = Number(poolData.slot0[1]);

                                console.log(`%c[MyPositions] SDK Calculation Input for Position #${item.tokenId}`, 'color: #f0a;', {
                                    token0: `${token0.symbol} (${token0.address})`,
                                    token1: `${token1.symbol} (${token1.address})`,
                                    fee,
                                    sqrtPriceX96: poolData.slot0[0].toString(),
                                    poolLiquidity: poolData.liquidity.toString(),
                                    tickCurrent: tickCurrent,
                                    positionLiquidity: liquidity.toString(),
                                    tickLower,
                                    tickUpper,
                                });
                
                                const v3Pool = new V3Pool(
                                    v3Token0,
                                    v3Token1,
                                    fee,
                                    JSBI.BigInt(poolData.slot0[0].toString()), // sqrtPriceX96
                                    JSBI.BigInt(poolData.liquidity.toString()), // pool liquidity
                                    tickCurrent // tick
                                );
                                
                                const v3Position = new V3Position({
                                    pool: v3Pool,
                                    liquidity: liquidity.toString(),
                                    tickLower: tickLower,
                                    tickUpper: tickUpper,
                                });

                                amount0Formatted = v3Position.amount0.toSignificant(6);
                                amount1Formatted = v3Position.amount1.toSignificant(6);

                            } catch (e) {
                                console.error("MyPositions: Error calculating position amounts with SDK:", e);
                            }
                        }

                        return {
                            id: item.tokenId,
                            token0,
                            token1,
                            fee,
                            liquidity,
                            pool,
                            tickLower,
                            tickUpper,
                            amount0Formatted,
                            amount1Formatted,
                        };
                    })
                    .filter((p): p is Position => p !== null);
                
                fetchedPositions.sort((a, b) => {
                    const aIsEmpty = a.liquidity === 0n;
                    const bIsEmpty = b.liquidity === 0n;

                    if (aIsEmpty && !bIsEmpty) return 1;
                    if (!aIsEmpty && bIsEmpty) return -1;
                    return Number(b.id - a.id);
                });
                
                setPositions(fetchedPositions);

            } catch (error) {
                console.error("MyPositions: Failed to fetch positions:", error);
                setPositions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPositions();
    }, [address, chain, isConnected, publicClient, tokensForChain, poolLookup, refetchCounter]);

    const handleBurn = async (tokenId: bigint) => {
        if (!walletClient || !address || !chain) return;

        setBurningPositionId(tokenId);
        try {
            const positionManagerAddress = CONTRACT_ADDRESSES[chain.id].POSITION_MANAGER;
            const burnTx = await walletClient.writeContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'burn',
                args: [tokenId],
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: burnTx });
            setRefetchCounter(c => c + 1);
        } catch (error) {
            console.error("Failed to burn NFT:", error);
        } finally {
            setBurningPositionId(null);
        }
    };
    
    const filteredPositions = useMemo(() => {
        if (showEmpty) {
            return positions;
        }
        return positions.filter(p => p.liquidity > 0n);
    }, [positions, showEmpty]);


    if (!isConnected || (positions.length === 0 && !isLoading)) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Positions</h2>
                <div className="flex items-center space-x-2">
                    <label htmlFor="show-empty" className="text-sm text-brand-text-secondary select-none">
                        Empty
                    </label>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="show-empty"
                            checked={showEmpty}
                            onChange={() => setShowEmpty(!showEmpty)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-brand-secondary rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-brand-surface peer-focus:ring-brand-primary peer-checked:bg-brand-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:ease-in-out after:duration-200 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                </div>
            </div>
            {isLoading ? (
                <div className="text-center text-brand-text-secondary py-8">Loading your positions...</div>
            ) : positions.length > 0 ? (
                 <div className="space-y-3">
                    {filteredPositions.map(pos => (
                        <div key={pos.id.toString()} className="bg-brand-surface-2 p-4 rounded-xl flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="flex -space-x-2 mr-3">
                                    <img src={pos.token0.logoURI} alt={pos.token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
                                    <img src={pos.token1.logoURI} alt={pos.token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
                                </div>
                                <div>
                                    <p className="font-bold text-base">{pos.token0.symbol}/{pos.token1.symbol}</p>
                                    <p className="text-xs text-brand-text-secondary">Fee: {pos.fee / 10000}%</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {pos.liquidity > 0n ? (
                                     <>
                                        <div className="text-right mr-2">
                                            <p className="font-mono text-sm font-semibold">{pos.amount0Formatted} {pos.token0.symbol}</p>
                                            <p className="font-mono text-sm text-brand-text-secondary">{pos.amount1Formatted} {pos.token1.symbol}</p>
                                        </div>
                                        <button
                                            onClick={() => onRemove(pos)}
                                            className="bg-brand-secondary hover:bg-gray-700 text-brand-text-primary font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => onIncrease(pos)}
                                            className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                                        >
                                            Add
                                        </button>
                                     </>
                                ) : (
                                    <button
                                        onClick={() => handleBurn(pos.id)}
                                        disabled={burningPositionId === pos.id}
                                        className="bg-brand-accent hover:opacity-90 text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {burningPositionId === pos.id ? 'Burning...' : 'Burn'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredPositions.length === 0 && !showEmpty &&
                        <div className="text-center text-brand-text-secondary py-8">You have no active liquidity positions.</div>
                    }
                 </div>
            ) : (
                <div className="text-center text-brand-text-secondary py-8">You have no liquidity positions on this network.</div>
            )}
        </div>
    );
};

export default MyPositions;