import React from 'react';
import { Pool } from '../types';

interface PoolTableRowProps {
    pool: Pool;
    onAdd: () => void;
    onRemove: () => void;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '...';
    if (value === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        notation: value >= 1000000 ? 'compact' : 'standard'
    }).format(value);
};

const PoolTableRow: React.FC<PoolTableRowProps> = ({ pool, onAdd, onRemove }) => {
    const { token0, token1, tvl, myLiquidity } = pool;

    return (
        <tr className="border-b border-brand-secondary last:border-b-0 hover:bg-brand-surface-2 transition-colors">
            <td className="p-4">
                <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                        <img src={token0.logoURI} alt={token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
                        <img src={token1.logoURI} alt={token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
                    </div>
                    <div>
                        <p className="font-bold text-base">{token0.symbol}/{token1.symbol}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-right font-mono text-brand-text-primary">
                {formatCurrency(tvl)}
            </td>
            <td className="p-4 text-right font-mono text-brand-text-primary">
                {formatCurrency(myLiquidity)}
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={onRemove}
                        className="border border-brand-secondary hover:bg-brand-secondary text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                    >
                        Remove
                    </button>
                    <button 
                        onClick={onAdd}
                        className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                    >
                        Add
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default PoolTableRow;
