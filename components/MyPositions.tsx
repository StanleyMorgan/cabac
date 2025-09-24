import React, { useMemo } from 'react';
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { TOKENS_BY_CHAIN } from '../constants';
import { Token } from '../types';

type PositionData = {
    token0: string;
    token1: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    liquidity: bigint;
    [key: string]: any;
};


// A component for a single position
const PositionItem = ({ positionData }: { positionData: PositionData }) => {
    const { chainId } = useAccount();
    const displayChainId = chainId || baseSepolia.id;
    const allTokens = useMemo(() => TOKENS_BY_CHAIN[displayChainId] || [], [displayChainId]);

    const token0 = useMemo(() => allTokens.find(t => t.address.toLowerCase() === positionData.token0.toLowerCase()), [allTokens, positionData.token0]);
    const token1 = useMemo(() => allTokens.find(t => t.address.toLowerCase() === positionData.token1.toLowerCase()), [allTokens, positionData.token1]);

    if (!token0 || !token1) {
        return (
            <div className="bg-brand-surface-2 p-3 rounded-lg animate-pulse h-16" />
        );
    }

    // Uniswap V3's global min/max ticks for full range
    const isFullRange = positionData.tickLower === -887272 && positionData.tickUpper === 887272;

    return (
        <div className="bg-brand-surface-2 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                    <img src={token0.logoURI} alt={token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
                    <img src={token1.logoURI} alt={token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
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

    const { data: balanceResult, isLoading: isBalanceLoading } = useReadContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        chainId: displayChainId,
        query: {
            enabled: !!address && !!positionManagerAddress && isConnected,
            select: (data) => Number(data),
        },
    });

    const positionCount = balanceResult ?? 0;

    const tokenIdsContracts = useMemo(() => {
        if (!address || !positionManagerAddress || positionCount === 0) return [];
        return Array.from({ length: positionCount }, (_, index) => ({
            address: positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(index)] as const,
            chainId: displayChainId,
        }));
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
        return tokenIds.map(tokenId => ({
            address: positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: 'positions',
            args: [tokenId],
            chainId: displayChainId,
        }));
    }, [positionManagerAddress, tokenIds, displayChainId]);

    const { data: positionsResults, isLoading: arePositionsLoading } = useReadContracts({
        contracts: positionsContracts,
        query: { enabled: tokenIds.length > 0 }
    });

    const positions = useMemo(() => {
        if (!positionsResults) return [];
        return positionsResults
            .filter(result => result.status === 'success' && (result.result as PositionData).liquidity > 0n)
            .map(result => result.result as PositionData);
    }, [positionsResults]);
    
    if (!isConnected) {
        return null; // Don't show the block if wallet is not connected
    }

    const isLoading = isBalanceLoading || areTokenIdsLoading || arePositionsLoading;

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
                        <PositionItem key={index} positionData={pos} />
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
