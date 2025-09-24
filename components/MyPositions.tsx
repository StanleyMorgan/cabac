import React, { useMemo, useEffect } from 'react';
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { POOLS_BY_CHAIN, TOKENS_BY_CHAIN } from '../constants';
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
    const { chainId } = useAccount();
    const displayChainId = chainId || baseSepolia.id;
    const allTokens = useMemo(() => TOKENS_BY_CHAIN[displayChainId] || [], [displayChainId]);

    // Find the token in our list, or create a fallback if it's not found.
    // This ensures that the component always has token data to render.
    const token0 = useMemo(() => {
        const foundToken = allTokens.find(t => t.address.toLowerCase() === positionData.token0.toLowerCase());
        return foundToken || createFallbackToken(positionData.token0);
    }, [allTokens, positionData.token0]);

    const token1 = useMemo(() => {
        const foundToken = allTokens.find(t => t.address.toLowerCase() === positionData.token1.toLowerCase());
        return foundToken || createFallbackToken(positionData.token1);
    }, [allTokens, positionData.token1]);


    // Uniswap V3's global min/max ticks for full range
    const isFullRange = positionData.tickLower === -887272 && positionData.tickUpper === 887272;

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
            <div className="text-right">
                {isFullRange ? (
                     <span className="text-xs font-semibold bg-brand-secondary text-brand-text-primary px-2 py-1 rounded-md">
                        Full Range
                    </span>
                ) : (
                    // A proper in-range check would require fetching the pool's current tick.
                    // For now, we assume non-full-range positions are managed.
                     <span className="text-xs font-semibold bg-brand-primary/50 text-blue-300 px-2 py-1 rounded-md">
                        Concentrated
                    </span>
                )}
            </div>
        </div>
    );
};


const MyPositions: React.FC = () => {
    const { address, chainId, isConnected } = useAccount();
    const displayChainId = chainId || baseSepolia.id;
    const contracts = useMemo(() => CONTRACT_ADDRESSES[displayChainId as keyof typeof CONTRACT_ADDRESSES], [displayChainId]);
    const positionManagerAddress = contracts?.POSITION_MANAGER;
    
    const allPoolsForChain = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
    }, [displayChainId]);

    const { data: balanceResult, isLoading: isBalanceLoading } = useReadContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'balanceOf',
        // FIX: Add `as const` to ensure TypeScript infers a tuple type for `args`, which is required for wagmi's type inference.
        args: address ? [address] as const : undefined,
        chainId: displayChainId,
        query: {
            enabled: !!address && !!positionManagerAddress && isConnected,
            select: (data) => Number(data),
        },
    });

    const positionCount = balanceResult ?? 0;

    const tokenIdsContracts = useMemo(() => {
        if (!address || !positionManagerAddress || positionCount === 0) return [];
        // FIX: Add `as const` to ensure proper type inference for useReadContracts.
        return Array.from({ length: positionCount }, (_, index) => ({
            address: positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(index)] as const,
            chainId: displayChainId,
        } as const));
    }, [address, positionManagerAddress, positionCount, displayChainId]);

    const { data: tokenIdsResults, isLoading: areTokenIdsLoading } = useReadContracts({
        contracts: tokenIdsContracts,
        query: { enabled: positionCount > 0 }
    });

    const tokenIds = useMemo(() => {
        if (!tokenIdsResults) return [];
        return tokenIdsResults
            .filter(result => result.status === 'success')
            .map(result => result.result as bigint);
    }, [tokenIdsResults]);

    const positionsContracts = useMemo(() => {
        if (!positionManagerAddress || tokenIds.length === 0) return [];
        // FIX: Add `as const` to fix the "Property 'result' does not exist on type 'never'" error
        // by allowing wagmi's `useReadContracts` hook to correctly infer the return type.
        return tokenIds.map(tokenId => ({
            address: positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'positions',
            // FIX: Add `as const` to ensure TypeScript infers a tuple type for `args`, which is required for wagmi's type inference.
            args: [tokenId] as const,
            chainId: displayChainId,
        } as const));
    }, [positionManagerAddress, tokenIds, displayChainId]);

    const { data: positionsResults, isLoading: arePositionsLoading } = useReadContracts({
        contracts: positionsContracts,
        query: { enabled: tokenIds.length > 0 }
    });

    const positions = useMemo(() => {
        if (!positionsResults) return [];

        const parsedPositions = positionsResults.map(result => {
            if (result.status !== 'success' || !result.result) {
                return null;
            }
            
            const rawPos = result.result as any;
            const liquidity = rawPos.liquidity ?? rawPos[7];

            if (typeof liquidity !== 'bigint' || liquidity <= 0n) {
                return null;
            }
            
            const positionToken0 = (rawPos.token0 ?? rawPos[2]).toLowerCase();
            const positionToken1 = (rawPos.token1 ?? rawPos[3]).toLowerCase();
            const positionFee = rawPos.fee ?? rawPos[4];
            
            const isKnownPool = allPoolsForChain.some(pool => {
                const poolToken0 = pool.token0.address.toLowerCase();
                const poolToken1 = pool.token1.address.toLowerCase();
                // Uniswap pools have token0/token1 sorted by address, which matches the position data.
                return (
                    positionToken0 === poolToken0 &&
                    positionToken1 === poolToken1 &&
                    positionFee === pool.fee
                );
            });

            if (!isKnownPool) {
                return null; // Filter out positions not in our constants file
            }
            
            // Construct a consistent object for rendering.
            return {
                token0: rawPos.token0 ?? rawPos[2],
                token1: rawPos.token1 ?? rawPos[3],
                fee: rawPos.fee ?? rawPos[4],
                tickLower: rawPos.tickLower ?? rawPos[5],
                tickUpper: rawPos.tickUpper ?? rawPos[6],
                liquidity: liquidity,
            } as PositionData;
        });
        
        // Filter out any positions that were null after parsing.
        return parsedPositions.filter((pos): pos is PositionData => pos !== null);
    }, [positionsResults, allPoolsForChain]);
    
    const isLoading = isBalanceLoading || areTokenIdsLoading || arePositionsLoading;

    useEffect(() => {
        console.groupCollapsed("%c 🔍 My Positions Diagnostics ", "color: #FFA500; font-weight: bold;");
        console.log("Is Connected:", isConnected);
        console.log("Chain ID:", displayChainId);
        console.log("User Address:", address);
        console.log("Position Manager Address:", positionManagerAddress);
        console.log("--- 1. Fetching Position Count (balanceOf) ---");
        console.log("Is Loading:", isBalanceLoading);
        console.log("Count:", positionCount);
        console.log("--- 2. Fetching Token IDs (tokenOfOwnerByIndex) ---");
        console.log("Is Loading:", areTokenIdsLoading);
        console.log("Contracts Sent:", tokenIdsContracts.length);
        console.log("Raw Results:", tokenIdsResults);
        console.log("Processed Token IDs:", tokenIds.map(id => id.toString()));
        console.log("--- 3. Fetching Position Details (positions) ---");
        console.log("Is Loading:", arePositionsLoading);
        console.log("Contracts Sent:", positionsContracts.length);
        console.log("Raw Results:", positionsResults);
        console.log("--- 4. Final Processed Positions ---");
        console.log("Filtered & Parsed Positions:", positions);
        console.log("Final Loading State:", isLoading);
        console.groupEnd();
    }, [
        isConnected, displayChainId, address, positionManagerAddress,
        isBalanceLoading, positionCount,
        areTokenIdsLoading, tokenIdsContracts, tokenIdsResults, tokenIds,
        arePositionsLoading, positionsContracts, positionsResults, positions,
        isLoading
    ]);
    
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
                        // Use a more stable key if possible, e.g., combining token addresses and ticks
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
