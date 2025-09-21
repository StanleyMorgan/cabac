import React from 'react';
import { useAccount } from 'wagmi';
import { POOLS_BY_CHAIN } from '../constants';
import { baseSepolia, sepolia, celoSepolia } from 'viem/chains';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

const Pools: React.FC = () => {
    const { chain } = useAccount();
    const displayChainId = chain?.id || baseSepolia.id;

    const pools = POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];

    const getExplorerUrl = (address: string) => {
        const explorers: Record<number, string | undefined> = {
            [baseSepolia.id]: `https://sepolia.basescan.org/address/${address}`,
            [sepolia.id]: `https://sepolia.etherscan.io/address/${address}`,
            [celoSepolia.id]: `https://sepolia.celoscan.io/address/${address}`
        };
        return explorers[displayChainId] || '#';
    }

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Liquidity Pools</h2>
            </div>
            <div className="space-y-3">
                {pools.length > 0 ? (
                    pools.map((pool) => (
                        <div key={pool.address} className="bg-brand-surface-2 p-4 rounded-xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="flex -space-x-3">
                                        <img src={pool.token0.logoURI} alt={pool.token0.name} className="w-8 h-8 rounded-full border-2 border-brand-surface" />
                                        <img src={pool.token1.logoURI} alt={pool.token1.name} className="w-8 h-8 rounded-full border-2 border-brand-surface" />
                                    </div>
                                    <span className="font-semibold text-lg">{pool.token0.symbol} / {pool.token1.symbol}</span>
                                </div>
                                <a
                                    href={getExplorerUrl(pool.address)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-text-secondary hover:text-brand-primary transition-colors"
                                    aria-label={`View pool ${pool.token0.symbol}/${pool.token1.symbol} on explorer`}
                                >
                                    <ExternalLinkIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-brand-text-secondary rounded-lg bg-brand-surface-2">
                        <p>No liquidity pools found on this network.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pools;
