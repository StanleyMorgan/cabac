import React, { useState, useMemo, useEffect } from 'react';
import type { Pool, Token } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useAccount, useReadContract, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256, BaseError } from 'viem';
import { POOL_ABI, POSITION_MANAGER_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../config';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}

// A simple reusable input component for this card
const LabeledInput = ({ label, value, onChange, placeholder, type = 'text', disabled = false }: { label: string, value: string, onChange: (val: string) => void, placeholder: string, type?: string, disabled?: boolean }) => (
    <div className="mb-3">
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <input
            type={type}
            inputMode={type === 'number' ? 'decimal' : 'text'}
            value={value}
            onChange={(e) => {
                if (type === 'number') {
                    if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                        onChange(e.target.value);
                    }
                } else {
                    onChange(e.target.value);
                }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-brand-surface-2 border border-brand-secondary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono disabled:opacity-50"
        />
    </div>
);


// --- Uniswap V3 Math Helpers ---

/**
 * Converts a price to a tick.
 * @param price The price of token0 in terms of token1.
 * @param token0 The first token.
 * @param token1 The second token.
 * @returns The tick.
 */
const priceToTick = (price: number, token0: Token, token1: Token): number => {
    const adjustedPrice = price * (10 ** (token1.decimals - token0.decimals));
    return Math.floor(Math.log(adjustedPrice) / Math.log(1.0001));
};

/**
 * Converts a sqrtPriceX96 to a human-readable price.
 * @param sqrtPriceX96 The sqrtPriceX96 from the pool.
 * @param token0 The first token.
 * @param token1 The second token.
 * @returns The price of token0 in terms of token1.
 */
const sqrtPriceX96ToPrice = (sqrtPriceX96: bigint, token0: Token, token1: Token): number => {
    const priceRatio = (Number(sqrtPriceX96) / 2**96)**2;
    return priceRatio / (10 ** (token1.decimals - token0.decimals));
};


const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
    const { address, chainId } = useAccount();
    const { token0, token1 } = pool;

    const contracts = useMemo(() => chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : undefined, [chainId]);

    // State for user inputs
    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const [priceLower, setPriceLower] = useState('');
    const [priceUpper, setPriceUpper] = useState('');

    // State for approvals
    const [isApproval0Needed, setIsApproval0Needed] = useState(false);
    const [isApproval1Needed, setIsApproval1Needed] = useState(false);

    // Fetch pool's current state (slot0) and tick spacing
    const { data: slot0, isLoading: isSlot0Loading } = useReadContract({
        address: pool.address as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'slot0',
        chainId,
        query: { enabled: !!chainId }
    });
    
    const { data: tickSpacingResult } = useReadContract({
        address: pool.address as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'tickSpacing',
        chainId,
        query: { enabled: !!chainId }
    });

    const tickSpacing = typeof tickSpacingResult === 'number' ? tickSpacingResult : 0;
    
    // Calculate current price from slot0
    const currentPrice = useMemo(() => {
        if (!slot0) return undefined;
        const sqrtPriceX96 = slot0[0];
        return sqrtPriceX96ToPrice(sqrtPriceX96, token0, token1);
    }, [slot0, token0, token1]);

    // Set a default price range when current price is loaded
    useEffect(() => {
        if (currentPrice && !priceLower && !priceUpper) {
            setPriceLower((currentPrice * 0.9).toPrecision(5));
            setPriceUpper((currentPrice * 1.1).toPrecision(5));
        }
    }, [currentPrice, priceLower, priceUpper]);

    // Memoize BigInt conversions for amounts and ticks
    const amount0BigInt = useMemo(() => amount0 ? parseUnits(amount0, token0.decimals) : 0n, [amount0, token0.decimals]);
    const amount1BigInt = useMemo(() => amount1 ? parseUnits(amount1, token1.decimals) : 0n, [amount1, token1.decimals]);

    const tickLower = useMemo(() => {
        const pLower = parseFloat(priceLower);
        if (!pLower || !tickSpacing) return undefined;
        const tick = priceToTick(pLower, token0, token1);
        return Math.floor(tick / tickSpacing) * tickSpacing;
    }, [priceLower, token0, token1, tickSpacing]);

    const tickUpper = useMemo(() => {
        const pUpper = parseFloat(priceUpper);
        if (!pUpper || !tickSpacing) return undefined;
        const tick = priceToTick(pUpper, token0, token1);
        return Math.ceil(tick / tickSpacing) * tickSpacing;
    }, [priceUpper, token0, token1, tickSpacing]);
    
    // Check allowances
    const { data: allowance0Result, refetch: refetchAllowance0 } = useReadContract({
        address: token0.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: (address && contracts?.POSITION_MANAGER) ? [address, contracts.POSITION_MANAGER] : undefined,
        chainId,
        query: { enabled: !!address && !!contracts?.POSITION_MANAGER }
    });
    const allowance0 = allowance0Result as bigint | undefined;

    const { data: allowance1Result, refetch: refetchAllowance1 } = useReadContract({
        address: token1.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: (address && contracts?.POSITION_MANAGER) ? [address, contracts.POSITION_MANAGER] : undefined,
        chainId,
        query: { enabled: !!address && !!contracts?.POSITION_MANAGER }
    });
    const allowance1 = allowance1Result as bigint | undefined;
    
    useEffect(() => {
        setIsApproval0Needed(typeof allowance0 === 'bigint' && amount0BigInt > 0n && allowance0 < amount0BigInt);
        setIsApproval1Needed(typeof allowance1 === 'bigint' && amount1BigInt > 0n && allowance1 < amount1BigInt);
    }, [allowance0, allowance1, amount0BigInt, amount1BigInt]);

    // Transaction simulation hooks
    const { data: approve0Result, error: approve0Error } = useSimulateContract({
        address: token0.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: contracts?.POSITION_MANAGER ? [contracts.POSITION_MANAGER, maxUint256] : undefined,
        query: { enabled: isApproval0Needed && !!contracts?.POSITION_MANAGER }
    });

    const { data: approve1Result, error: approve1Error } = useSimulateContract({
        address: token1.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: contracts?.POSITION_MANAGER ? [contracts.POSITION_MANAGER, maxUint256] : undefined,
        query: { enabled: !isApproval0Needed && isApproval1Needed && !!contracts?.POSITION_MANAGER }
    });

    const mintParams = useMemo(() => {
        if (!address || tickLower === undefined || tickUpper === undefined || (amount0BigInt <= 0n && amount1BigInt <= 0n)) return undefined;
        return {
            token0: token0.address as `0x${string}`,
            token1: token1.address as `0x${string}`,
            // FIX: Use the pool's fee from props instead of a hardcoded value.
            fee: pool.fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0BigInt,
            amount1Desired: amount1BigInt,
            amount0Min: 0n,
            amount1Min: 0n,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
        };
    }, [address, token0, token1, tickLower, tickUpper, amount0BigInt, amount1BigInt, pool]);

    const { data: mintResult, isError: isMintSimError, error: mintError } = useSimulateContract({
        address: contracts?.POSITION_MANAGER,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: mintParams ? [mintParams] : undefined,
        query: { enabled: !!mintParams && !isApproval0Needed && !isApproval1Needed }
    });

    const { writeContract, data: txHash, isPending: isTxPending, reset } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isTxSuccess) {
            void refetchAllowance0();
            void refetchAllowance1();
            reset();
        }
    }, [isTxSuccess, reset, refetchAllowance0, refetchAllowance1]);

    const handleApprove = (request: any) => {
        if (!request) return;
        writeContract(request);
    };

    const handleMint = () => {
        if (!mintResult?.request) return;
        writeContract(mintResult.request);
    };

    // Diagnostic logging
    useEffect(() => {
        console.groupCollapsed("%c 💧 Add Liquidity Diagnostics ", "color: #4C82FB; font-weight: bold;");
        console.log("Chain ID:", chainId);
        console.log("User Address:", address);
        console.log("Contracts:", contracts);
        console.log("Pool:", pool);
        console.log("--- Amounts ---");
        console.log(`Amount 0 (${token0.symbol}):`, { input: amount0, bigint: amount0BigInt.toString() });
        console.log(`Amount 1 (${token1.symbol}):`, { input: amount1, bigint: amount1BigInt.toString() });
        console.log("--- Price Range ---");
        console.log("Current Price:", currentPrice?.toPrecision(5) ?? "Loading...");
        console.log("Lower Price Input:", priceLower);
        console.log("Upper Price Input:", priceUpper);
        console.log("--- Ticks ---");
        console.log("Tick Lower (calculated):", tickLower);
        console.log("Tick Upper (calculated):", tickUpper);
        console.log("Tick Spacing:", tickSpacing);
        console.log("--- Approvals ---");
        console.log(`Token 0 Allowance:`, typeof allowance0 === 'bigint' ? formatUnits(allowance0, token0.decimals) : allowance0);
        console.log(`Is Approval 0 Needed:`, isApproval0Needed);
        console.log(`Token 1 Allowance:`, typeof allowance1 === 'bigint' ? formatUnits(allowance1, token1.decimals) : allowance1);
        console.log(`Is Approval 1 Needed:`, isApproval1Needed);
        console.log("--- Simulations ---");
        console.log("Approve 0 Sim:", { request: approve0Result?.request, error: approve0Error?.message });
        console.log("Approve 1 Sim:", { request: approve1Result?.request, error: approve1Error?.message });
        console.log("Mint Params:", mintParams);
        console.log("Mint Sim:", { request: mintResult?.request, isError: isMintSimError, error: (mintError as BaseError)?.shortMessage || mintError?.message });
        console.log("--- Transaction ---");
        console.log("Tx Pending:", isTxPending);
        console.log("Tx Confirming:", isTxConfirming);
        console.log("Tx Hash:", txHash);
        console.groupEnd();
    }, [
        chainId, address, contracts, pool, token0, token1, amount0, amount1, amount0BigInt, amount1BigInt,
        currentPrice, priceLower, priceUpper, tickLower, tickUpper, tickSpacing,
        allowance0, allowance1, isApproval0Needed, isApproval1Needed,
        approve0Result, approve0Error, approve1Result, approve1Error, mintParams, mintResult, isMintSimError, mintError,
        isTxPending, isTxConfirming, txHash
    ]);


    const getButtonAction = () => {
        if (!address) {
            return { text: 'Connect Wallet', action: () => {}, disabled: true };
        }
        if (isTxPending) return { text: 'Check Wallet...', action: () => {}, disabled: true };
        if (isTxConfirming) return { text: 'Transaction Confirming...', action: () => {}, disabled: true };
        
        if (isApproval0Needed) {
            return { text: `Approve ${token0.symbol}`, action: () => handleApprove(approve0Result?.request), disabled: !approve0Result?.request };
        }
        if (isApproval1Needed) {
            return { text: `Approve ${token1.symbol}`, action: () => handleApprove(approve1Result?.request), disabled: !approve1Result?.request };
        }

        if (amount0BigInt <= 0n && amount1BigInt <= 0n) {
             return { text: 'Enter an amount', action: () => {}, disabled: true };
        }
        
        if (isMintSimError) {
             return { text: 'Cannot Add Liquidity', action: () => {}, disabled: true };
        }

        return { text: 'Add Liquidity', action: handleMint, disabled: !mintResult?.request };
    };

    const { text: buttonText, action: buttonAction, disabled: isButtonDisabled } = getButtonAction();

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                        <img src={token0.logoURI} alt={token0.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
                        <img src={token1.logoURI} alt={token1.symbol} className="w-7 h-7 rounded-full border-2 border-brand-surface" />
                    </div>
                    <h2 className="text-xl font-bold">Add Liquidity</h2>
                </div>
            </div>

            <div className="bg-brand-surface-2 p-4 rounded-xl">
                 <LabeledInput
                    label={`Amount of ${token0.symbol}`}
                    value={amount0}
                    onChange={setAmount0}
                    placeholder="0.0"
                    type="number"
                />
                 <LabeledInput
                    label={`Amount of ${token1.symbol}`}
                    value={amount1}
                    onChange={setAmount1}
                    placeholder="0.0"
                    type="number"
                />
            </div>

            <div className="bg-brand-surface-2 p-4 rounded-xl mt-4">
                <h3 className="font-semibold mb-2">Set Price Range</h3>
                 <div className="text-sm text-brand-text-secondary text-center mb-3">
                     Current Price: {isSlot0Loading ? 'Loading...' : currentPrice?.toPrecision(5) ?? 'N/A'} {token1.symbol} per {token0.symbol}
                 </div>
                <div className="grid grid-cols-2 gap-3">
                    <LabeledInput label="Min Price" value={priceLower} onChange={setPriceLower} placeholder="0.0" type="number" />
                    <LabeledInput label="Max Price" value={priceUpper} onChange={setPriceUpper} placeholder="0.0" type="number" />
                </div>
            </div>

             <button
                onClick={buttonAction}
                disabled={isButtonDisabled}
                className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-6"
            >
                {buttonText}
            </button>
        </div>
    );
};

export default AddLiquidityCard;