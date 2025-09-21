import React from 'react';
import type { Pool } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface PoolListItemProps {
  pool: Pool;
  onSelect: (pool: Pool) => void;
}

const PoolListItem: React.FC<PoolListItemProps> = ({ pool, onSelect }) => {
  const { token0, token1 } = pool;

  return (
    <li className="mb-2">
      <div className="flex items-center justify-between p-3 bg-brand-surface-2 rounded-lg">
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            <img src={token0.logoURI} alt={token0.name} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
            <img src={token1.logoURI} alt={token1.name} className="w-7 h-7 rounded-full border-2 border-brand-surface-2" />
          </div>
          <div>
            <div className="font-bold">{token0.symbol} / {token1.symbol}</div>
            <div className="text-sm text-brand-text-secondary">Uniswap V3</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
              onClick={() => onSelect(pool)}
              className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors"
          >
              Add Liquidity
          </button>
          <a href={`https://app.uniswap.org/pools/${pool.address}`} target="_blank" rel="noopener noreferrer" className="text-brand-text-secondary hover:text-brand-text-primary">
            <ExternalLinkIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </li>
  );
};

export default PoolListItem;
