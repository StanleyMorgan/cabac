import React from 'react';
import type { Pool } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}


const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
  return (
    <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
        <div className="flex items-center mb-4">
            <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Add Liquidity</h2>
        </div>
        <div className="text-center text-brand-text-secondary py-16">
            <p className="text-lg">This feature is coming soon!</p>
            <p className="mt-2">You are trying to add liquidity to the {pool.token0.symbol}/{pool.token1.symbol} pool.</p>
        </div>
    </div>
  );
};

export default AddLiquidityCard;
