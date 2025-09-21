import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Token } from '../types';
import { TOKENS_BY_CHAIN, NATIVE_TOKEN_ADDRESS } from '../constants';
import { ROUTER_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../config';
import { useDebounce } from '../hooks/useDebounce';
import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SettingsModal from './SettingsModal';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { baseSepolia } from 'viem/chains';

interface SwapCardProps {
    isWalletConnected: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected }) => {
    const { address, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();
    
    // Use a default chain for display purposes when not connected
    const displayChainId = chainId || baseSepolia.id;

    const isSupportedChain = useMemo(() => {
        if (!chainId) return false;
        const hasTokens = !!TOKENS_BY_CHAIN[chainId as keyof typeof TOKENS_BY_CHAIN];
        const hasContracts = !!CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
        return hasTokens && hasContracts;
    }, [chainId]);

    const contracts = useMemo(() => chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : undefined, [chainId]);

    const availableTokens = useMemo(() => {
        return TOKENS_BY_CHAIN[displayChainId as keyof typeof TOKENS_BY_CHAIN] || [];
    }, [displayChainId]);

    const [tokenIn, setTokenIn] = useState<Token | null>(null);
    const [tokenOut, setTokenOut] = useState<Token | null>(null);
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');
    const [isSelectingFor, setIsSelectingFor] = useState<'in' | 'out' | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState(0.5);
    const [amountOutMinimum, setAmountOutMinimum] = useState(0n);
    const [isApprovalNeeded, setIsApprovalNeeded] = useState(false);

    const debouncedAmountIn = useDebounce(amountIn, 500);
    const amountInBigInt = useMemo(() => {
        try {
            return debouncedAmountIn && tokenIn ? parseUnits(debouncedAmountIn, tokenIn.decimals) : 0n;
        } catch {
            return 0n;
        }
    }, [debouncedAmountIn, tokenIn]);

    const { data: balanceIn } = useBalance({ address, token: tokenIn?.address === NATIVE_TOKEN_ADDRESS ? undefined : tokenIn?.address as `0x${string}`, chainId });
    const { data: balanceOut } = useBalance({ address, token: tokenOut?.address === NATIVE_TOKEN_ADDRESS ? undefined : tokenOut?.address as `0x${string}`, chainId });

    // FIX: Changed `writeContractAsync` to `writeContract` to fix TypeScript inference issue.
    const { writeContract, data: txHash, isPending: isTxPending, reset } = useWriteContract();
    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        abi: ERC20_ABI,
        address: tokenIn?.address as `0x${string}`,
        functionName: 'allowance',
        args: (address && contracts?.ROUTER) ? [address, contracts.ROUTER] : undefined,
        chainId: chainId,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!address && !!tokenIn && tokenIn.address !== NATIVE_TOKEN_ADDRESS && !!contracts?.ROUTER,
        },
    });

    // FIX: Removed generic types from useSimulateContract to allow for automatic type inference.
    const { data: approveResult } = useSimulateContract({
        address: tokenIn?.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: contracts?.ROUTER ? [contracts.ROUTER, maxUint256] : undefined,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!address && !!tokenIn && tokenIn.address !== NATIVE_TOKEN_ADDRESS && !!contracts?.ROUTER && isApprovalNeeded,
        },
    });

    const quoteArgs = useMemo(() => {
        if (!tokenIn || !tokenOut || !address || !contracts?.ROUTER || !contracts?.WETH || amountInBigInt <= 0) return undefined;
        return {
            tokenIn: (tokenIn.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenIn.address) as `0x${string}`,
            tokenOut: (tokenOut.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenOut.address) as `0x${string}`,
            fee: 3000,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            amountIn: amountInBigInt,
            amountOutMinimum: 0n,
            sqrtPriceLimitX96: 0n,
        };
    }, [tokenIn, tokenOut, address, contracts, amountInBigInt]);

    const { data: quoteResult, isLoading: isQuoteLoading } = useSimulateContract({
        address: contracts?.ROUTER,
        abi: ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: quoteArgs ? [quoteArgs] : undefined,
        value: tokenIn?.address === NATIVE_TOKEN_ADDRESS ? amountInBigInt : undefined,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!quoteArgs && !isApprovalNeeded,
        },
    });
    
    const swapArgs = useMemo(() => {
        if (!tokenIn || !tokenOut || !address || !contracts?.ROUTER || !contracts?.WETH || amountInBigInt <= 0 || amountOutMinimum <= 0n) return undefined;
        return {
            tokenIn: (tokenIn.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenIn.address) as `0x${string}`,
            tokenOut: (tokenOut.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenOut.address) as `0x${string}`,
            fee: 3000,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            amountIn: amountInBigInt,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0n,
        };
    }, [tokenIn, tokenOut, address, contracts, amountInBigInt, amountOutMinimum]);

    // FIX: Removed generic types from useSimulateContract to allow for automatic type inference.
    const { data: swapResult } = useSimulateContract({
        address: contracts?.ROUTER,
        abi: ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: swapArgs ? [swapArgs] : undefined,
        value: tokenIn?.address === NATIVE_TOKEN_ADDRESS ? amountInBigInt : undefined,
        // FIX: The 'enabled' option should be inside a 'query' object for wagmi v2 hooks.
        query: {
            enabled: !!swapArgs && !isApprovalNeeded,
        },
    });

    const exchangeRate = useMemo(() => {
        const numAmountIn = parseFloat(amountIn);
        const numAmountOut = parseFloat(amountOut);
        if (numAmountIn > 0 && numAmountOut > 0) {
            return (numAmountOut / numAmountIn).toFixed(4);
        }
        return '...';
    }, [amountIn, amountOut]);

    useEffect(() => {
        if (tokenIn && tokenIn.address !== NATIVE_TOKEN_ADDRESS && allowance !== undefined && amountInBigInt > 0) {
            setIsApprovalNeeded(allowance < amountInBigInt);
        } else {
            setIsApprovalNeeded(false);
        }
    }, [allowance, amountInBigInt, tokenIn]);

    useEffect(() => {
        if (quoteResult && tokenOut) {
            const quoteAmount = quoteResult.result;
            if (typeof quoteAmount === 'bigint' && quoteAmount > 0n) {
                const formattedAmount = formatUnits(quoteAmount, tokenOut.decimals);
                setAmountOut(formattedAmount);
                const newAmountOutMinimum = quoteAmount * (10000n - BigInt(Math.floor(slippage * 100))) / 10000n;
                setAmountOutMinimum(newAmountOutMinimum);
            }
        }
    }, [quoteResult, tokenOut, slippage]);


    useEffect(() => {
        if (amountInBigInt <= 0n) {
            setAmountOut('');
            setAmountOutMinimum(0n);
        }
    }, [amountInBigInt]);
    
    useEffect(() => {
        if (availableTokens.length > 0 && (!tokenIn || !tokenOut)) {
            setTokenIn(availableTokens[0]);
            setTokenOut(availableTokens.length > 1 ? availableTokens[1] : availableTokens[0]);
        } else if (availableTokens.length === 0) {
            setTokenIn(null);
            setTokenOut(null);
        }
        setAmountIn('');
        setAmountOut('');
    }, [availableTokens, tokenIn, tokenOut]);

     useEffect(() => {
        if (isTxSuccess) {
            void refetchAllowance();
            reset();
        }
    }, [isTxSuccess, reset, refetchAllowance]);

    const handleTokenSelect = useCallback((token: Token) => {
        if (isSelectingFor === 'in') {
            if (token.symbol === tokenOut?.symbol) setTokenOut(tokenIn);
            setTokenIn(token);
        } else if (isSelectingFor === 'out') {
             if (token.symbol === tokenIn?.symbol) setTokenIn(tokenOut);
            setTokenOut(token);
        }
        setIsSelectingFor(null);
    }, [isSelectingFor, tokenIn, tokenOut]);

    const handleSwapTokens = useCallback(() => {
        setTokenIn(tokenOut);
        setTokenOut(tokenIn);
        setAmountIn(amountOut);
        setAmountOut(amountIn);
    }, [tokenIn, tokenOut, amountIn, amountOut]);
    
    // FIX: Made function synchronous and use `writeContract`.
    const handleApprove = () => {
        if (!approveResult?.request) return;
        try {
            writeContract(approveResult.request);
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };
    
    // FIX: Made function synchronous and use `writeContract`.
    const handleSwap = () => {
        if (!swapResult?.request) return;
        try {
             writeContract(swapResult.request);
        } catch (error) {
            console.error("Swap failed:", error);
        }
    }

    const getButtonText = () => {
        if (!isWalletConnected) return 'Connect Wallet';
        if (!isSupportedChain) return 'Unsupported Network';
        if (isTxPending) return 'Check Wallet...';
        if (isTxConfirming) return 'Transaction Confirming...';
        if (isApprovalNeeded) return `Approve ${tokenIn?.symbol}`;
        if (!amountIn || parseFloat(amountIn) <= 0) return 'Enter an amount';
        return 'Swap';
    };
    
    if (isWalletConnected && (!isSupportedChain || !tokenIn || !tokenOut)) {
       return (
          <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Swap</h2>
                  <button disabled className="text-brand-text-secondary">
                      <SettingsIcon className="w-6 h-6" />
                  </button>
              </div>
              <div className="h-28 bg-brand-surface-2 rounded-xl mb-1 flex items-center justify-center text-brand-text-secondary">
                  {!isSupportedChain && chainId ? 'Network not supported' : 'Loading...'}
              </div>
              <div className="h-28 bg-brand-surface-2 rounded-xl"></div>
              <button
                  disabled
                  className="w-full bg-brand-secondary text-white text-lg font-bold py-3 rounded-xl disabled:cursor-not-allowed transition-all mt-4"
                >
                    {isSupportedChain ? 'Loading...' : 'Unsupported Network'}
                </button>
          </div>
      );
    }
    
    if (!tokenIn || !tokenOut) {
        // Initial loading state before default tokens are set
        return (
             <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
                <div className="h-96 animate-pulse"></div>
            </div>
        )
    }
    
    return (
        <>
            <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Swap</h2>
                    <button onClick={() => setIsSettingsOpen(true)} className="text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative">
                    <TokenInput
                        label="You pay"
                        token={tokenIn}
                        amount={amountIn}
                        onAmountChange={setAmountIn}
                        onTokenSelect={() => setIsSelectingFor('in')}
                        balance={balanceIn?.formatted}
                        isBalanceLoading={isWalletConnected && !balanceIn}
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 my-[-12px] z-10">
                        <button onClick={handleSwapTokens} className="bg-brand-secondary hover:bg-brand-surface-2 rounded-full p-2 border-4 border-brand-surface transition-transform duration-300 ease-in-out hover:rotate-180">
                           <ArrowDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <TokenInput
                        label="You receive"
                        token={tokenOut}
                        amount={amountOut}
                        onAmountChange={() => {}}
                        onTokenSelect={() => setIsSelectingFor('out')}
                        balance={balanceOut?.formatted}
                        isBalanceLoading={isWalletConnected && !balanceOut}
                        isOutput={true}
                    />
                </div>

                <div className="text-sm text-brand-text-secondary p-2 text-center h-6">
                   {isQuoteLoading ? (
                        <span className="inline-block w-48 h-4 bg-brand-surface-2 rounded animate-pulse align-middle" />
                   ) : (
                     amountIn && parseFloat(amountIn) > 0 && amountOut && `1 ${tokenIn.symbol} ≈ ${exchangeRate} ${tokenOut.symbol}`
                   )}
                </div>

                <button
                    onClick={isWalletConnected ? (isApprovalNeeded ? handleApprove : handleSwap) : openConnectModal}
                    disabled={(isWalletConnected && !isSupportedChain) || isTxPending || isTxConfirming || (isWalletConnected && !isApprovalNeeded && (!amountIn || parseFloat(amountIn) <= 0 || !swapResult?.request)) || (isWalletConnected && isApprovalNeeded && !approveResult?.request)}
                    className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-4"
                >
                    {getButtonText()}
                </button>
            </div>

            {isSelectingFor && (
                <TokenSelectorModal
                    isOpen={!!isSelectingFor}
                    onClose={() => setIsSelectingFor(null)}
                    onSelectToken={handleTokenSelect}
                    tokens={availableTokens}
                />
            )}
            {isSettingsOpen && (
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    slippage={slippage}
                    setSlippage={setSlippage}
                />
            )}
        </>
    );
};

export default SwapCard;
