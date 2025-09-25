import React, { useState } from 'react';
import type { Pool, Token } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import TokenInput from './TokenInput';
import { useAccount, useBalance } from 'wagmi';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}


const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
    const { address, chain } = useAccount();
    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');

    const { data: balance0, isLoading: isBalance0Loading } = useBalance({
        address,
        token: pool.token0.address as `0x${string}`,
        chainId: chain?.id,
    });
     const { data: balance1, isLoading: isBalance1Loading } = useBalance({
        address,
        token: pool.token1.address as `0x${string}`,
        chainId: chain?.id,
    });


    // In a real app, amounts would be linked by the pool's price
    const handleAmount0Change = (value: string) => {
        setAmount0(value);
        setAmount1(value); // simple 1:1 ratio for demo
    }

    const handleAmount1Change = (value: string) => {
        setAmount1(value);
        setAmount0(value); // simple 1:1 ratio for demo
    }

  return (
    <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
                <h2 className="text-xl font-bold">Add Liquidity</h2>
                <p className="text-sm text-brand-text-secondary">{pool.token0.symbol}/{pool.token1.symbol}</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <TokenInput
                label="Amount"
                token={pool.token0}
                amount={amount0}
                onAmountChange={handleAmount0Change}
                onTokenSelect={() => {}}
                balance={balance0?.formatted}
                isBalanceLoading={isBalance0Loading}
            />
             <TokenInput
                label="Amount"
                token={pool.token1}
                amount={amount1}
                onAmountChange={handleAmount1Change}
                onTokenSelect={() => {}}
                balance={balance1?.formatted}
                isBalanceLoading={isBalance1Loading}
            />
        </div>

        <div className="mt-6">
             <button
                disabled
                className="w-full bg-brand-primary text-white font-bold py-4 px-4 rounded-xl transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Add (Coming Soon)
            </button>
        </div>
        
    </div>
  );
};

export default AddLiquidityCard;
