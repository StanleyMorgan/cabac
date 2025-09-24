import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Pool } from '../types';
import { useAccount, useBalance, useReadContract, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { POOL_ABI, ERC20_ABI, CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
    const { address, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { token0, token1 } = pool;

    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const { writeContract, data: txHash, isPending: isTxPending, reset } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const contracts = useMemo(() => chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : undefined, [chainId]);

    const amount0BigInt = useMemo(() => {
        try {
            return amount0 ? parseUnits(amount0, token0.decimals) : 0n;
        } catch {
            return 0n;
        }
    }, [amount0, token0.decimals]);

    const amount1BigInt = useMemo(() => {
        try {
            return amount1 ? parseUnits(amount1, token1.decimals) : 0n;
        } catch {
            return 0n;
        }
    }, [amount1, token1.decimals]);

    const { data: balance0 } = useBalance({ address, token: token0.address as `0x${string}`, chainId });
    const { data: balance1 } = useBalance({ address, token: token1.address as `0x${string}`, chainId });

    const { data: allowance0, refetch: refetchAllowance0 } = useReadContract({
        abi: ERC20_ABI,
        address: token0.address as `0x${string}`,
        functionName: 'allowance',
        args: (address && contracts?.POSITION_MANAGER) ? [address, contracts.POSITION_MANAGER] : undefined,
        chainId,
        query: {
            enabled: !!address && !!contracts?.POSITION_MANAGER && amount0BigInt > 0n,
        },
    });

    const { data: allowance1, refetch: refetchAllowance1 } = useReadContract({
        abi: ERC20_ABI,
        address: token1.address as `0x${string}`,
        functionName: 'allowance',
        args: (address && contracts?.POSITION_MANAGER) ? [address, contracts.POSITION_MANAGER] : undefined,
        chainId,
        query: {
            enabled: !!address && !!contracts?.POSITION_MANAGER && amount1BigInt > 0n,
        },
    });

    const { data: slot0, isLoading: isSlot0Loading } = useReadContract({
        address: pool.address as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'slot0',
        chainId,
        query: { enabled: !!chainId },
    });
    
    const { data: tickSpacing } = useReadContract({
        address: pool.address as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'tickSpacing',
        chainId,
        query: { enabled: !!chainId },
    });
    
    const currentPrice = useMemo(() => {
        if (!slot0) return 0;
        const sqrtPriceX96 = slot0[0];
        // price = token1/token0
        const price = (Number(sqrtPriceX96) / 2**96)**2;
        // Adjust for decimals
        return price * (10**(token0.decimals - token1.decimals));
    }, [slot0, token0.decimals, token1.decimals]);
    
    useEffect(() => {
        if(currentPrice > 0 && !minPrice && !maxPrice) {
            setMinPrice((currentPrice * 0.8).toPrecision(5));
            setMaxPrice((currentPrice * 1.2).toPrecision(5));
        }
    }, [currentPrice, minPrice, maxPrice]);

    const [tickLower, tickUpper] = useMemo(() => {
        const minP = parseFloat(minPrice);
        const maxP = parseFloat(maxPrice);

        if (!isFinite(minP) || !isFinite(maxP) || minP <= 0 || maxP <= 0 || minP >= maxP || !tickSpacing) {
            return [undefined, undefined];
        }

        const priceToTick = (p: number) => {
            const price = p / (10**(token0.decimals - token1.decimals));
            return Math.log(price) / Math.log(1.0001);
        }

        const MIN_TICK = -887272;
        const MAX_TICK = 887272;

        const lower = Math.ceil(priceToTick(minP) / Number(tickSpacing)) * Number(tickSpacing);
        const upper = Math.floor(priceToTick(maxP) / Number(tickSpacing)) * Number(tickSpacing);

        return [Math.max(lower, MIN_TICK), Math.min(upper, MAX_TICK)];
    }, [minPrice, maxPrice, tickSpacing, token0.decimals, token1.decimals]);

    // FIX: Used `typeof allowance0 === 'bigint'` to correctly narrow the type for comparison.
    const isApproval0Needed = useMemo(() => typeof allowance0 === 'bigint' && amount0BigInt > 0n && allowance0 < amount0BigInt, [allowance0, amount0BigInt]);
    // FIX: Used `typeof allowance1 === 'bigint'` to correctly narrow the type for comparison.
    const isApproval1Needed = useMemo(() => typeof allowance1 === 'bigint' && amount1BigInt > 0n && allowance1 < amount1BigInt, [allowance1, amount1BigInt]);

    // FIX: Removed generic types from useSimulateContract to allow for automatic type inference.
    const { data: approve0Result } = useSimulateContract({
        // FIX: Cast token address to `0x${string}` to match wagmi's expected type.
        address: token0.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: contracts?.POSITION_MANAGER ? [contracts.POSITION_MANAGER, maxUint256] : undefined,
        query: { enabled: isApproval0Needed && !!contracts?.POSITION_MANAGER },
    });

    // FIX: Removed generic types from useSimulateContract to allow for automatic type inference.
    const { data: approve1Result } = useSimulateContract({
        // FIX: Cast token address to `0x${string}` to match wagmi's expected type.
        address: token1.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: contracts?.POSITION_MANAGER ? [contracts.POSITION_MANAGER, maxUint256] : undefined,
        query: { enabled: isApproval1Needed && !!contracts?.POSITION_MANAGER },
    });

    const mintParams = useMemo(() => {
        if (!address || !contracts?.POSITION_MANAGER || amount0BigInt <= 0n || amount1BigInt <= 0n || tickLower === undefined || tickUpper === undefined) {
            return undefined;
        }
        return {
            token0: token0.address,
            token1: token1.address,
            fee: 3000,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0BigInt,
            amount1Desired: amount1BigInt,
            amount0Min: 0n,
            amount1Min: 0n,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
        };
    }, [address, contracts, amount0BigInt, amount1BigInt, tickLower, tickUpper, token0, token1]);

    // FIX: Removed generic types from useSimulateContract to allow for automatic type inference.
    const { data: mintResult } = useSimulateContract({
        address: contracts?.POSITION_MANAGER,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: mintParams ? [mintParams] : undefined,
        query: { enabled: !!mintParams && !isApproval0Needed && !isApproval1Needed },
    });

    useEffect(() => {
        if (isTxSuccess) {
            const wasMint = !isApproval0Needed && !isApproval1Needed;
            void refetchAllowance0();
            void refetchAllowance1();
            if (wasMint) {
                 setAmount0('');
                 setAmount1('');
            }
            reset();
        }
    }, [isTxSuccess, reset, refetchAllowance0, refetchAllowance1, isApproval0Needed, isApproval1Needed]);

    const handleApprove = (approveRequest: any) => {
        if (!approveRequest) return;
        try {
            writeContract(approveRequest);
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const handleMint = useCallback(() => {
        if (!mintResult?.request) return;
        try {
            writeContract(mintResult.request);
        } catch (error) {
            console.error("Mint failed:", error);
        }
    }, [mintResult, writeContract]);

    const getButtonAction = () => {
        if (!address) return { text: 'Connect Wallet', action: openConnectModal, disabled: false };
        if (isTxPending) return { text: 'Check Wallet...', action: () => {}, disabled: true };
        if (isTxConfirming) return { text: 'Transaction Confirming...', action: () => {}, disabled: true };
        if (!amount0 || !amount1 || amount0BigInt <= 0n || amount1BigInt <= 0n) return { text: 'Enter Amounts', action: () => {}, disabled: true };
        if (tickLower === undefined || tickUpper === undefined) return { text: 'Invalid Price Range', action: () => {}, disabled: true };
        if (isApproval0Needed) return { text: `Approve ${token0.symbol}`, action: () => handleApprove(approve0Result?.request), disabled: !approve0Result?.request };
        if (isApproval1Needed) return { text: `Approve ${token1.symbol}`, action: () => handleApprove(approve1Result?.request), disabled: !approve1Result?.request };
        return { text: 'Add Liquidity', action: handleMint, disabled: !mintResult?.request };
    }

    const { text, action, disabled } = getButtonAction();

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
                    <input type="text" inputMode="decimal" placeholder="0.0" className="bg-transparent text-2xl font-mono focus:outline-none w-full" value={amount0} onChange={(e) => setAmount0(e.target.value)} />
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
                    <input type="text" inputMode="decimal" placeholder="0.0" className="bg-transparent text-2xl font-mono focus:outline-none w-full" value={amount1} onChange={(e) => setAmount1(e.target.value)} />
                    <div className="flex items-center space-x-2 bg-brand-secondary p-2 rounded-full">
                        <img src={token1.logoURI} alt={token1.name} className="w-6 h-6 rounded-full" />
                        <span className="font-bold text-lg">{token1.symbol}</span>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface-2 p-4 rounded-xl">
                 <h3 className="text-lg font-semibold mb-3">Set Price Range</h3>
                <div className="text-center text-sm text-brand-text-secondary mb-3">
                    Current Price: {isSlot0Loading ? <span className="inline-block w-24 h-4 bg-brand-secondary rounded animate-pulse align-middle" /> : `1 ${token1.symbol} = ${currentPrice.toPrecision(5)} ${token0.symbol}`}
                </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-brand-text-secondary">Min Price</label>
                        <input type="text" inputMode="decimal" placeholder="0.0" className="bg-brand-surface border border-brand-secondary rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    </div>
                    <div>
                         <label className="text-sm text-brand-text-secondary">Max Price</label>
                         <input type="text" inputMode="decimal" placeholder="0.0" className="bg-brand-surface border border-brand-secondary rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                 </div>
            </div>

            <button
                onClick={action}
                disabled={disabled}
                className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-4"
            >
                {text}
            </button>
        </div>
    );
};

export default AddLiquidityCard;