import React from 'react';
import type { Pool } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { useNetwork } from 'wagmi';

interface PoolListItemProps {
  pool: Pool;
  onSelect: (pool: Pool) => void;
}

const PoolListItem: React.FC<PoolListItemProps> = ({ pool, onSelect }) => {
  const { chain } = useNetwork();
  const explorerUrl = chain?.blockExplorers?.default.url;

  return (
    <li>
      <div className="w-full flex items-center justify-between p-3 hover:bg-brand-secondary rounded-lg transition-colors group">
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            <img src={pool.token0.logoURI} alt={pool.token0.name} className="w-8 h-8 rounded-full border-2 border-brand-surface" />
            <img src={pool.token1.logoURI} alt={pool.token1.name} className="w-8 h-8 rounded-full border-2 border-brand-surface" />
          </div>
          <div>
            <div className="font-bold text-left">{pool.token0.symbol}/{pool.token1.symbol}</div>
            <div className="text-sm text-brand-text-secondary text-left flex items-center">
              Uniswap V3
              {explorerUrl && (
                <a
                  href={`${explorerUrl}/address/${pool.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelect(pool)}
          className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors"
        >
          Add Liquidity
        </button>
      </div>
    </li>
  );
};

export default PoolListItem;
