import React from 'react';
import { Pool } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { useAccount } from 'wagmi';

interface PoolListItemProps {
    pool: Pool;
    onSelect: () => void;
}

const PoolListItem: React.FC<PoolListItemProps> = ({ pool, onSelect }) => {
    const { chain } = useAccount();
    const { token0, token1 } = pool;
    const blockExplorerUrl = chain?.blockExplorers?.default.url;

    return (
        <div className="bg-brand-surface-2 p-4 rounded-xl">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                        <img src={token0.logoURI} alt={token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
                        <img src={token1.logoURI} alt={token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
                    </div>
                    <div>
                        <p className="font-bold text-lg">{token0.symbol}/{token1.symbol}</p>
                        <p className="text-xs text-brand-text-secondary">Uniswap V3</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {blockExplorerUrl && (
                        <a 
                            href={`${blockExplorerUrl}/address/${pool.address}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-text-secondary hover:text-brand-primary transition-colors"
                            aria-label={`View ${token0.symbol}/${token1.symbol} pool on block explorer`}
                        >
                           <ExternalLinkIcon className="w-5 h-5" />
                        </a>
                    )}
                    <button 
                        onClick={onSelect}
                        className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PoolListItem;