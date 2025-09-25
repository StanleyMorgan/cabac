import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { TOKENS_BY_CHAIN } from '../constants';
import { Token } from '../types';

interface Position {
    id: bigint;
    token0: Token;
    token1: Token;
    fee: number;
    liquidity: bigint;
}

const MyPositions: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const publicClient = usePublicClient();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const tokensForChain = useMemo(() => {
        const tokenMap = new Map<string, Token>();
        if (chain) {
            TOKENS_BY_CHAIN[chain.id]?.forEach(token => {
                tokenMap.set(token.address.toLowerCase(), token);
            });
        }
        return tokenMap;
    }, [chain]);

    useEffect(() => {
        const fetchPositions = async () => {
            if (!publicClient || !address || !chain || !CONTRACT_ADDRESSES[chain.id]) {
                setPositions([]);
                return;
            };

            console.log("MyPositions: Starting to fetch positions for address:", address, "on chain:", chain.id);
            setIsLoading(true);
            try {
                const positionManagerAddress = CONTRACT_ADDRESSES[chain.id].POSITION_MANAGER;
                console.log("MyPositions: Using Position Manager address:", positionManagerAddress);

                // FIX: Cast parameters to `any` to work around a deep type instantiation issue in viem.
                const balance = await publicClient.readContract({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'balanceOf',
                    args: [address],
                } as any);
                console.log("MyPositions: NFT balance (position count):", balance.toString());


                if (balance === BigInt(0)) {
                    setPositions([]);
                    console.log("MyPositions: No positions found. Halting fetch.");
                    return;
                }

                const tokenIdsCalls = Array.from({ length: Number(balance) }, (_, i) => ({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'tokenOfOwnerByIndex',
                    args: [address, BigInt(i)],
                }));

                console.log("MyPositions: Fetching token IDs...");
                const tokenIdsResults = await publicClient.multicall({ contracts: tokenIdsCalls } as any);
                const tokenIds = tokenIdsResults.filter(r => r.status === 'success').map(r => r.result as bigint);
                console.log("MyPositions: Fetched Token IDs:", tokenIds.map(id => id.toString()));

                const positionsCalls = tokenIds.map(tokenId => ({
                    address: positionManagerAddress,
                    abi: POSITION_MANAGER_ABI,
                    functionName: 'positions',
                    args: [tokenId],
                }));
                
                console.log("MyPositions: Fetching position details for", tokenIds.length, "tokens...");
                const positionsResults = await publicClient.multicall({ contracts: positionsCalls } as any);
                console.log("MyPositions: Position details results raw:", positionsResults);


                const fetchedPositions: Position[] = positionsResults
                    .map((r, i) => ({ result: r.result, tokenId: tokenIds[i] }))
                    .filter(item => item.result)
                    .map(item => {
                        const posData = item.result as any; // Result from `positions` call
                        const token0 = tokensForChain.get(posData[2].toLowerCase());
                        const token1 = tokensForChain.get(posData[3].toLowerCase());

                        if (!token0 || !token1) {
                            console.warn("MyPositions: Could not find token definitions for position", item.tokenId.toString(), "with token addresses", posData[2], posData[3]);
                            return null;
                        };

                        return {
                            id: item.tokenId,
                            token0,
                            token1,
                            fee: posData[4],
                            liquidity: posData[7],
                        };
                    })
                    .filter((p): p is Position => p !== null);
                
                console.log("MyPositions: Final parsed positions:", fetchedPositions);
                setPositions(fetchedPositions);

            } catch (error) {
                console.error("MyPositions: Failed to fetch positions:", error);
                setPositions([]);
            } finally {
                setIsLoading(false);
                console.log("MyPositions: Fetching complete.");
            }
        };

        fetchPositions();
    }, [address, chain, isConnected, publicClient, tokensForChain]);

    if (!isConnected || positions.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <h2 className="text-xl font-bold mb-4">My Positions</h2>
            {isLoading ? (
                <div className="text-center text-brand-text-secondary py-8">Loading your positions...</div>
            ) : positions.length > 0 ? (
                 <div className="space-y-3">
                    {positions.map(pos => (
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
                            <div className="text-right">
                                <p className="font-mono text-sm">{formatUnits(pos.liquidity, 0)} LP</p>
                                <div className="flex items-center justify-end space-x-2 mt-1">
                                    <button className="text-xs bg-brand-secondary hover:bg-gray-700 text-brand-text-primary font-semibold py-1 px-2 rounded-md">Add</button>
                                    <button className="text-xs bg-brand-secondary hover:bg-gray-700 text-brand-text-primary font-semibold py-1 px-2 rounded-md">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="text-center text-brand-text-secondary py-8">You have no liquidity positions on this network.</div>
            )}
        </div>
    );
};

export default MyPositions;