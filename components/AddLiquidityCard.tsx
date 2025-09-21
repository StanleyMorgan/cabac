import React, { useState, useMemo, useEffect } from 'react';
import type { Pool } from '../types';
import { useAccount, useBalance, useReadContract, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { POOL_ABI, ERC20_ABI, CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
    const { address, chainId } = useAccount();
    const { token0, token1 } = pool;

    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const contracts = useMemo(() => chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : undefined, [chainId]);

    const { data: balance0 } = useBalance({ address, token: token0.address as `0x${string}`, chainId });
    const { data: balance1 } = useBalance({ address, token: token1.address as `0x${string}`, chainId });

    const { data: slot0, isLoading: isSlot0Loading } = useReadContract({
        address: pool.address,
        abi: POOL_ABI,
        functionName: 'slot0',
        chainId,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!chainId,
        },
    });
    
    const { data: tickSpacing } = useReadContract({
        address: pool.address,
        abi: POOL_ABI,
        functionName: 'tickSpacing',
        chainId,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!chainId,
        },
    });
    
    const currentPrice = useMemo(() => {
        if (!slot0) return 0;
        const sqrtPriceX96 = slot0[0];
        const price = (Number(sqrtPriceX96) / 2**96)**2;
        return price;
    }, [slot0]);
    
    const currentTick = useMemo(() => slot0 ? slot0[1] : 0, [slot0]);

    useEffect(() => {
        if(currentPrice > 0 && !minPrice && !maxPrice) {
            // Default to a +/- 20% range
            setMinPrice((currentPrice * 0.8).toFixed(4));
            setMaxPrice((currentPrice * 1.2).toFixed(4));
        }
    }, [currentPrice, minPrice, maxPrice]);

    const handleAmount0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) setAmount0(value);
    };

    const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) setAmount1(value);
    };

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Add Liquidity</h2>
            </div>

            <div className="bg-brand-surface-2 p-4 rounded-xl mb-1">
                <div className="flex justify-between items-center text-sm text-brand-text-secondary mb-2">
                    <span>Amount</span>
                    <span>Balance: {balance0 ? parseFloat(balance0.formatted).toFixed(4) : '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <input type="text" inputMode="decimal" placeholder="0.0" className="bg-transparent text-2xl font-mono focus:outline-none w-full" value={amount0} onChange={handleAmount0Change} />
                    <div className="flex items-center space-x-2 bg-brand-secondary p-2 rounded-full">
                        <img src={token0.logoURI} alt={token0.name} className="w-6 h-6 rounded-full" />
                        <span className="font-bold text-lg">{token0.symbol}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center my-2 text-2xl font-bold">+</div>

            <div className="bg-brand-surface-2 p-4 rounded-xl mb-4">
                 <div className="flex justify-between items-center text-sm text-brand-text-secondary mb-2">
                    <span>Amount</span>
                    <span>Balance: {balance1 ? parseFloat(balance1.formatted).toFixed(4) : '0.00'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <input type="text" inputMode="decimal" placeholder="0.0" className="bg-transparent text-2xl font-mono focus:outline-none w-full" value={amount1} onChange={handleAmount1Change} />
                    <div className="flex items-center space-x-2 bg-brand-secondary p-2 rounded-full">
                        <img src={token1.logoURI} alt={token1.name} className="w-6 h-6 rounded-full" />
                        <span className="font-bold text-lg">{token1.symbol}</span>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface-2 p-4 rounded-xl">
                 <h3 className="text-lg font-semibold mb-3">Set Price Range</h3>
                <div className="text-center text-sm text-brand-text-secondary mb-3">
                    Current Price: {isSlot0Loading ? <span className="inline-block w-24 h-4 bg-brand-secondary rounded animate-pulse align-middle" /> : `1 ${token1.symbol} = ${currentPrice.toFixed(4)} ${token0.symbol}`}
                </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-brand-text-secondary">Min Price</label>
                        <input type="text" inputMode="decimal" placeholder="0.0" className="bg-brand-surface border border-brand-secondary rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-brand-primary" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    </div>
                    <div>
                         <label className="text-sm text-brand-text-secondary">Max Price</label>
                         <input type="text" inputMode="decimal" placeholder="0.0" className="bg-brand-surface border border-brand-secondary rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-brand-primary" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                 </div>
            </div>

            <button
                // Logic for approvals and mint will go here
                disabled
                className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-4"
            >
                Add (Coming Soon)
            </button>
        </div>
    );
};

export default AddLiquidityCard;