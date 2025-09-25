import React, { useState, useEffect } from 'react';
import type { Pool } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import TokenInput from './TokenInput';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, ERC20_ABI, POOL_ABI, POSITION_MANAGER_ABI } from '../config';

interface AddLiquidityCardProps {
  pool: Pool;
  onBack: () => void;
}


const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool, onBack }) => {
    const { address, chain, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');

    const [status, setStatus] = useState<'idle' | 'approving' | 'minting'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [tickSpacing, setTickSpacing] = useState<number | null>(null);

    const { data: balance0, isLoading: isBalance0Loading, refetch: refetchBalance0 } = useBalance({
        address,
        token: pool.token0.address as `0x${string}`,
        chainId: chain?.id,
    });
     const { data: balance1, isLoading: isBalance1Loading, refetch: refetchBalance1 } = useBalance({
        address,
        token: pool.token1.address as `0x${string}`,
        chainId: chain?.id,
    });

    useEffect(() => {
        const fetchTickSpacing = async () => {
            if (!publicClient || !pool.address) return;
            try {
                // FIX: Cast to any to work around a deep type instantiation issue in viem.
                const spacing = await publicClient.readContract({
                    address: pool.address as `0x${string}`,
                    abi: POOL_ABI,
                    functionName: 'tickSpacing',
                } as any);
                setTickSpacing(Number(spacing));
            } catch (e) {
                console.error("Failed to fetch tick spacing", e);
                setError("Could not load pool details. This pair might not exist on the selected network.");
            }
        };
        fetchTickSpacing();
    }, [publicClient, pool.address]);


    const handleAmount0Change = (value: string) => {
        setAmount0(value);
    }

    const handleAmount1Change = (value: string) => {
        setAmount1(value);
    }

    const handleAddLiquidity = async () => {
        if (!walletClient || !address || !chain || !publicClient || !tickSpacing) return;
        if (!amount0 || !amount1 || parseFloat(amount0) <= 0 || parseFloat(amount1) <= 0) {
            setError("Please enter valid amounts for both tokens.");
            return;
        }
        setError(null);
        setStatus('approving');
    
        try {
            const positionManagerAddress = CONTRACT_ADDRESSES[chain.id]?.POSITION_MANAGER;
            if (!positionManagerAddress) {
                throw new Error("Position Manager contract not found for this chain.");
            }
    
            const amount0Parsed = parseUnits(amount0, pool.token0.decimals);
            const amount1Parsed = parseUnits(amount1, pool.token1.decimals);
    
            // --- Approve Token 0 ---
             // FIX: Cast to any to work around a deep type instantiation issue in viem.
            const allowance0 = await publicClient.readContract({
                address: pool.token0.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, positionManagerAddress],
            } as any);
            
            // FIX: Cast allowance to bigint as readContract result is unknown due to `as any`.
            if ((allowance0 as bigint) < amount0Parsed) {
                const approveTx0 = await walletClient.writeContract({
                    address: pool.token0.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [positionManagerAddress, amount0Parsed],
                    chain,
                    account: address,
                });
                await publicClient.waitForTransactionReceipt({ hash: approveTx0 });
            }
    
            // --- Approve Token 1 ---
             // FIX: Cast to any to work around a deep type instantiation issue in viem.
            const allowance1 = await publicClient.readContract({
                address: pool.token1.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, positionManagerAddress],
            } as any);
    
            // FIX: Cast allowance to bigint as readContract result is unknown due to `as any`.
            if ((allowance1 as bigint) < amount1Parsed) {
                const approveTx1 = await walletClient.writeContract({
                    address: pool.token1.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [positionManagerAddress, amount1Parsed],
                    chain,
                    account: address,
                });
                await publicClient.waitForTransactionReceipt({ hash: approveTx1 });
            }
    
            setStatus('minting');
            
            // --- Mint Position ---
            // For a "full range" position, we use the min and max possible ticks, adjusted for the pool's tick spacing.
            const MIN_TICK = -887272;
            const MAX_TICK = 887272;
            // FIX: tickLower and tickUpper should be numbers for `int24` types, not bigints.
            const tickLower = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing;
            const tickUpper = Math.floor(MAX_TICK / tickSpacing) * tickSpacing;
    
            const mintParams = {
                token0: pool.token0.address as `0x${string}`,
                token1: pool.token1.address as `0x${string}`,
                fee: pool.fee,
                tickLower,
                tickUpper,
                amount0Desired: amount0Parsed,
                amount1Desired: amount1Parsed,
                amount0Min: 0n, // We accept any amount of slippage for simplicity
                amount1Min: 0n,
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes from now
            };
    
            const mintTx = await walletClient.writeContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'mint',
                args: [mintParams],
                chain,
                account: address,
            });
    
            await publicClient.waitForTransactionReceipt({ hash: mintTx });
    
            // Success
            refetchBalance0();
            refetchBalance1();
            setAmount0('');
            setAmount1('');
            setStatus('idle');
            onBack(); // Go back to the pools list
    
        } catch (err: any) {
            console.error(err);
            setError(err.shortMessage || "An error occurred while adding liquidity.");
            setStatus('idle');
        }
    };

    const isButtonDisabled = !isConnected || 
        !amount0 || 
        !amount1 || 
        parseFloat(amount0) <= 0 || 
        parseFloat(amount1) <= 0 || 
        status !== 'idle' ||
        !tickSpacing ||
        parseFloat(amount0) > parseFloat(balance0?.formatted || '0') ||
        parseFloat(amount1) > parseFloat(balance1?.formatted || '0');


    const buttonText = () => {
        if (!isConnected) return 'Connect Wallet';
        if (!tickSpacing && !error) return 'Loading Pool...';
        if (error) return 'Error Loading Pool';
        if (status === 'approving') return 'Approving...';
        if (status === 'minting') return 'Adding Liquidity...';
        if (!amount0 || !amount1) return 'Enter amounts';
        if (parseFloat(amount0) > parseFloat(balance0?.formatted || '0')) return `Insufficient ${pool.token0.symbol}`;
        if (parseFloat(amount1) > parseFloat(balance1?.formatted || '0')) return `Insufficient ${pool.token1.symbol}`;
        return 'Add Liquidity';
    };

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
                onClick={handleAddLiquidity}
                disabled={isButtonDisabled}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-4 px-4 rounded-xl transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {buttonText()}
            </button>
            {error && <p className="text-brand-accent text-sm mt-3 text-center">{error}</p>}
        </div>
        
    </div>
  );
};

export default AddLiquidityCard;