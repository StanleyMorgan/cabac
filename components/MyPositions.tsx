import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { TOKENS_BY_CHAIN, POOLS_BY_CHAIN } from '../constants';
import { Token } from '../types';

type PositionData = {
    token0: string;
    token1: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    liquidity: bigint;
};

// Helper to create a fallback token object for tokens not in our constants list
const createFallbackToken = (address: string): Token => ({
  address,
  symbol: `${address.slice(0, 5)}...${address.slice(-4)}`,
  name: 'Unknown Token',
  // A self-contained SVG placeholder icon to avoid broken images
  logoURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzRBNTU2OCIvPjx0ZXh0IHg9IjEyIiB5PSIxNyIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pjwvc3ZnPg==',
  decimals: 18, // Default to 18, which is common
});


// A component for a single position
const PositionItem = ({ positionData }: { positionData: PositionData }) => {
    const { chain } = useAccount();
    const displayChainId = chain?.id || baseSepolia.id;
    const allTokens = useMemo(() => TOKENS_BY_CHAIN[displayChainId] || [], [displayChainId]);

    // Find the token in our list, or create a fallback if it's not found.
    const token0 = useMemo(() => {
        const foundToken = allTokens.find(t => t.address.toLowerCase() === positionData.token0.toLowerCase());
        return foundToken || createFallbackToken(positionData.token0);
    }, [allTokens, positionData.token0]);

    const token1 = useMemo(() => {
        const foundToken = allTokens.find(t => t.address.toLowerCase() === positionData.token1.toLowerCase());
        return foundToken || createFallbackToken(positionData.token1);
    }, [allTokens, positionData.token1]);

    return (
        <div className="bg-brand-surface-2 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                    <img src={token0.logoURI} alt={token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface bg-gray-600" />
                    <img src={token1.logoURI} alt={token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface bg-gray-600" />
                </div>
                <div>
                    <p className="font-bold text-base">{token0.symbol}/{token1.symbol}</p>
                    <p className="text-xs text-brand-text-secondary">{positionData.fee / 10000}% Fee Tier</p>
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <button
                    className="border border-brand-secondary hover:bg-brand-secondary text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                >
                    Remove
                </button>
                <button
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                >
                    Add
                </button>
            </div>
        </div>
    );
};


const MyPositions: React.FC = () => {
    const { address, isConnected, chain } = useAccount();
    const chainId = chain?.id;
    
    const displayChainId = chainId || baseSepolia.id;

    const publicClient = usePublicClient({ chainId: displayChainId });

    const contracts = useMemo(() => CONTRACT_ADDRESSES[displayChainId as keyof typeof CONTRACT_ADDRESSES], [displayChainId]);
    const positionManagerAddress = contracts?.POSITION_MANAGER;
    
    const allPoolsForChain = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const [positions, setPositions] = useState<PositionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPositions = useCallback(async () => {
        if (!publicClient || !address || !positionManagerAddress) {
            setPositions([]);
            return;
        }
        
        setIsLoading(true);
        try {
            // 1. Fetch balance
            const balance = await publicClient.readContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'balanceOf',
                args: [address],
                // @ts-ignore - viem/wagmi typing issue with Celo support
                authorizationList: [],
            });

            const positionCount = Number(balance);
            if (positionCount === 0) {
                setPositions([]);
                return;
            }

            // 2. Fetch all token IDs
            const tokenIdsContracts = Array.from({ length: positionCount }, (_, index) => ({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(index)],
            }));

            // FIX: The `multicall` function does not accept an `authorizationList` parameter. Removing it to fix the type error.
            const tokenIdsResults = await publicClient.multicall({ contracts: tokenIdsContracts });
            const tokenIds = tokenIdsResults
                .filter(r => r.status === 'success' && r.result)
                .map(r => r.result as bigint);

            if (tokenIds.length === 0) {
                setPositions([]);
                return;
            }
            
            // 3. Fetch all position details
            const positionsContracts = tokenIds.map(tokenId => ({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'positions',
                args: [tokenId],
            }));
            // FIX: Cast contracts to `any` to avoid a deep type instantiation issue with viem's multicall.
            // FIX: The `multicall` function does not accept an `authorizationList` parameter. Removing it to fix the type error.
            const positionsResults = await publicClient.multicall({ contracts: positionsContracts as any });

            // 4. Parse and filter results
            const parsedPositions = positionsResults.map(result => {
                if (result.status !== 'success' || !result.result) return null;

                const rawPos = result.result;
                const liquidity = rawPos[7]; // liquidity is at index 7

                if (typeof liquidity !== 'bigint' || liquidity <= 0n) return null;

                const positionToken0 = rawPos[2].toLowerCase();
                const positionToken1 = rawPos[3].toLowerCase();
                const positionFee = rawPos[4];

                const isKnownPool = allPoolsForChain.some(pool =>
                    (pool.token0.address.toLowerCase() === positionToken0 &&
                    pool.token1.address.toLowerCase() === positionToken1 &&
                    pool.fee === positionFee) || 
                    (pool.token0.address.toLowerCase() === positionToken1 &&
                    pool.token1.address.toLowerCase() === positionToken0 &&
                    pool.fee === positionFee)
                );

                if (!isKnownPool) return null;
                
                return {
                    token0: rawPos[2],
                    token1: rawPos[3],
                    fee: rawPos[4],
                    tickLower: rawPos[5],
                    tickUpper: rawPos[6],
                    liquidity: liquidity,
                } as PositionData;
            });
            
            setPositions(parsedPositions.filter((p): p is PositionData => p !== null));

        } catch (error) {
            console.error("Failed to fetch positions:", error);
            setPositions([]);
        } finally {
            setIsLoading(false);
        }

    }, [publicClient, address, positionManagerAddress, allPoolsForChain]);

    useEffect(() => {
        if (isConnected) {
            fetchPositions();
        } else {
            setPositions([]);
        }
    }, [isConnected, fetchPositions]);
    
    if (!isConnected) {
        return null; // Don't show the block if wallet is not connected
    }

    return (
        <div className="bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <h2 className="text-xl font-bold mb-4">My Positions</h2>
            {isLoading ? (
                <div className="space-y-3">
                   <div className="bg-brand-surface-2 p-3 rounded-lg animate-pulse h-16 w-full" />
                </div>
            ) : positions.length > 0 ? (
                <div className="space-y-3">
                    {positions.map((pos, index) => (
                        <PositionItem key={`${pos.token0}-${pos.token1}-${pos.tickLower}-${index}`} positionData={pos} />
                    ))}
                </div>
            ) : (
                 <div className="text-center text-brand-text-secondary py-8">
                    <p>You have no open positions on this network.</p>
                </div>
            )}
        </div>
    );
};

export default MyPositions;