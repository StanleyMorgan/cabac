import React, { useState } from 'react';
import type { Position } from './MyPositions';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import TokenInput from './TokenInput';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, ERC20_ABI, POSITION_MANAGER_ABI } from '../config';

interface IncreaseLiquidityCardProps {
  position: Position;
  onBack: () => void;
}

const MAX_UINT256 = 2n**256n - 1n;

const IncreaseLiquidityCard: React.FC<IncreaseLiquidityCardProps> = ({ position, onBack }) => {
    const { address, chain, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { token0, token1 } = position;

    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');

    const [status, setStatus] = useState<'idle' | 'approving' | 'increasing'>('idle');
    const [error, setError] = useState<string | null>(null);
    
    const { data: balance0, isLoading: isBalance0Loading, refetch: refetchBalance0 } = useBalance({
        address,
        token: token0.address as `0x${string}`,
        chainId: chain?.id,
    });
     const { data: balance1, isLoading: isBalance1Loading, refetch: refetchBalance1 } = useBalance({
        address,
        token: token1.address as `0x${string}`,
        chainId: chain?.id,
    });

    const handleAmount0Change = (value: string) => {
        setAmount0(value);
    }

    const handleAmount1Change = (value: string) => {
        setAmount1(value);
    }

    const handleIncreaseLiquidity = async () => {
        if (!walletClient || !address || !chain || !publicClient) return;
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
    
            const amount0Parsed = parseUnits(amount0, token0.decimals);
            const amount1Parsed = parseUnits(amount1, token1.decimals);
    
            // --- Approve Token 0 ---
            console.log(`%c[INCREASE_LIQUIDITY] Checking allowance for ${token0.symbol}...`, 'color: #999; font-weight: bold;');
            const allowance0 = await publicClient.readContract({
                address: token0.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, positionManagerAddress],
            } as any);
            console.log(`%c[INCREASE_LIQUIDITY] Allowance for ${token0.symbol}:`, 'color: #999;', { allowance: (allowance0 as bigint).toString(), needed: amount0Parsed.toString() });
            
            if ((allowance0 as bigint) < amount0Parsed) {
                console.log(`%c[INCREASE_LIQUIDITY] Approving ${token0.symbol} for MAX_UINT256...`, 'color: orange; font-weight: bold;');
                const approveTx0 = await walletClient.writeContract({
                    address: token0.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [positionManagerAddress, MAX_UINT256],
                    chain,
                    account: address,
                });
                await publicClient.waitForTransactionReceipt({ hash: approveTx0 });
                console.log(`%c[INCREASE_LIQUIDITY] ${token0.symbol} approved!`, 'color: lightgreen;');
            }
    
            // --- Approve Token 1 ---
            console.log(`%c[INCREASE_LIQUIDITY] Checking allowance for ${token1.symbol}...`, 'color: #999; font-weight: bold;');
            const allowance1 = await publicClient.readContract({
                address: token1.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, positionManagerAddress],
            } as any);
            console.log(`%c[INCREASE_LIQUIDITY] Allowance for ${token1.symbol}:`, 'color: #999;', { allowance: (allowance1 as bigint).toString(), needed: amount1Parsed.toString() });

            if ((allowance1 as bigint) < amount1Parsed) {
                console.log(`%c[INCREASE_LIQUIDITY] Approving ${token1.symbol} for MAX_UINT256...`, 'color: orange; font-weight: bold;');
                const approveTx1 = await walletClient.writeContract({
                    address: token1.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [positionManagerAddress, MAX_UINT256],
                    chain,
                    account: address,
                });
                await publicClient.waitForTransactionReceipt({ hash: approveTx1 });
                 console.log(`%c[INCREASE_LIQUIDITY] ${token1.symbol} approved!`, 'color: lightgreen;');
            }
    
            setStatus('increasing');
            
            const increaseParams = {
                tokenId: position.id,
                amount0Desired: amount0Parsed,
                amount1Desired: amount1Parsed,
                amount0Min: 0n,
                amount1Min: 0n,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            };

            console.log('%c[INCREASE_LIQUIDITY] Calling increaseLiquidity with params:', 'color: orange; font-weight: bold;', {
                ...increaseParams,
                tokenId: increaseParams.tokenId.toString(),
                amount0Desired: increaseParams.amount0Desired.toString(),
                amount1Desired: increaseParams.amount1Desired.toString(),
                deadline: increaseParams.deadline.toString(),
            });
    
            const increaseTx = await walletClient.writeContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'increaseLiquidity',
                args: [increaseParams],
                chain,
                account: address,
            });
    
            await publicClient.waitForTransactionReceipt({ hash: increaseTx });
    
            refetchBalance0();
            refetchBalance1();
            setAmount0('');
            setAmount1('');
            setStatus('idle');
            onBack();
    
        } catch (err: any) {
            console.error("%c[INCREASE_LIQUIDITY] Failed to increase liquidity. Full error:", 'color: red; font-weight: bold;', err);
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
        parseFloat(amount0) > parseFloat(balance0?.formatted || '0') ||
        parseFloat(amount1) > parseFloat(balance1?.formatted || '0');


    const buttonText = () => {
        if (!isConnected) return 'Connect Wallet';
        if (status === 'approving') return 'Approving...';
        if (status === 'increasing') return 'Increasing Liquidity...';
        if (!amount0 || !amount1) return 'Enter amounts';
        if (parseFloat(amount0) > parseFloat(balance0?.formatted || '0')) return `Insufficient ${token0.symbol}`;
        if (parseFloat(amount1) > parseFloat(balance1?.formatted || '0')) return `Insufficient ${token1.symbol}`;
        return 'Increase Liquidity';
    };

  return (
    <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
                <h2 className="text-xl font-bold">Increase Liquidity</h2>
                <p className="text-sm text-brand-text-secondary">{token0.symbol}/{token1.symbol}</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <TokenInput
                label="Amount"
                token={token0}
                amount={amount0}
                onAmountChange={handleAmount0Change}
                onTokenSelect={() => {}}
                balance={balance0?.formatted}
                isBalanceLoading={isBalance0Loading}
            />
             <TokenInput
                label="Amount"
                token={token1}
                amount={amount1}
                onAmountChange={handleAmount1Change}
                onTokenSelect={() => {}}
                balance={balance1?.formatted}
                isBalanceLoading={isBalance1Loading}
            />
        </div>

        <div className="mt-6">
             <button
                onClick={handleIncreaseLiquidity}
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

export default IncreaseLiquidityCard;