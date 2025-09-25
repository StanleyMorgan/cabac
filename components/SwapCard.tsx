import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Token } from '../types';
import { TOKENS_BY_CHAIN, NATIVE_TOKEN_ADDRESS, POOLS_BY_CHAIN } from '../constants';
import { ROUTER_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../config';
import { useDebounce } from '../hooks/useDebounce';
import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SettingsModal from './SettingsModal';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits, maxUint256, BaseError } from 'viem';
import { baseSepolia } from 'viem/chains';

interface SwapCardProps {
    isWalletConnected: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected }) => {
    const { open } = useAppKit();
    const { address, chain } = useAccount();
    const chainId = chain?.id;
    
    const displayChainId = chainId || baseSepolia.id;
    
    const publicClient = usePublicClient({ chainId: displayChainId });
    const { data: walletClient } = useWalletClient({ chainId: displayChainId });

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
    
    const allPoolsForChain = useMemo(() => {
        return POOLS_BY_CHAIN[displayChainId as keyof typeof POOLS_BY_CHAIN] || [];
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

    // State for transactions
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [isTxPending, setIsTxPending] = useState(false);
    const [isTxConfirming, setIsTxConfirming] = useState(false);
    const [isTxSuccess, setIsTxSuccess] = useState(false);

    const debouncedAmountIn = useDebounce(amountIn, 500);
    const amountInBigInt = useMemo(() => {
        try {
            return debouncedAmountIn && tokenIn ? parseUnits(debouncedAmountIn, tokenIn.decimals) : 0n;
        } catch {
            return 0n;
        }
    }, [debouncedAmountIn, tokenIn]);

    // --- Data Fetching States ---
    const [balanceIn, setBalanceIn] = useState<{ value: bigint; formatted: string; } | undefined>();
    const [isBalanceInFetching, setIsBalanceInFetching] = useState(false);
    const [balanceOut, setBalanceOut] = useState<{ value: bigint; formatted: string; } | undefined>();
    const [isBalanceOutFetching, setIsBalanceOutFetching] = useState(false);
    const [allowance, setAllowance] = useState<bigint | undefined>();
    const [isAllowanceFetching, setIsAllowanceFetching] = useState(false);
    const [quoteResult, setQuoteResult] = useState<{ result: bigint } | null>(null);
    const [isQuoteFetching, setIsQuoteFetching] = useState(false);
    const [quoteError, setQuoteError] = useState<Error | null>(null);
    const [approveResult, setApproveResult] = useState<{ request: any } | null>(null);
    const [swapResult, setSwapResult] = useState<{ request: any } | null>(null);
    const [swapError, setSwapError] = useState<Error | null>(null);
    
    // --- Data Fetching Functions ---
    const fetchBalance = useCallback(async (token: Token | null, setBalance: Function, setLoading: Function) => {
        if (!publicClient || !address || !token) {
            setBalance(undefined);
            return;
        }
        setLoading(true);
        try {
            const isNative = token.address === NATIVE_TOKEN_ADDRESS;
            const balanceValue = isNative
                ? await publicClient.getBalance({ address })
                : await publicClient.readContract({
                    address: token.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address]
                  });

            setBalance({ value: balanceValue, formatted: formatUnits(balanceValue, token.decimals) });
        } catch (e) {
            console.error("Failed to fetch balance:", e);
            setBalance(undefined);
        } finally {
            setLoading(false);
        }
    }, [publicClient, address]);

    const fetchAllowance = useCallback(async () => {
        if (!publicClient || !address || !tokenIn || tokenIn.address === NATIVE_TOKEN_ADDRESS || !contracts?.ROUTER) {
            setAllowance(undefined);
            return;
        }
        setIsAllowanceFetching(true);
        try {
            const result = await publicClient.readContract({
                abi: ERC20_ABI,
                address: tokenIn.address as `0x${string}`,
                functionName: 'allowance',
                args: [address, contracts.ROUTER],
            });
            setAllowance(result);
        } catch (e) {
            console.error("Failed to fetch allowance:", e);
        } finally {
            setIsAllowanceFetching(false);
        }
    }, [publicClient, address, tokenIn, contracts]);


    useEffect(() => { fetchBalance(tokenIn, setBalanceIn, setIsBalanceInFetching); }, [fetchBalance, tokenIn]);
    useEffect(() => { fetchBalance(tokenOut, setBalanceOut, setIsBalanceOutFetching); }, [fetchBalance, tokenOut]);
    useEffect(() => { fetchAllowance(); }, [fetchAllowance]);


    const selectedPool = useMemo(() => {
        if (!tokenIn || !tokenOut) return undefined;
        // Natively handle ETH by comparing with WETH address in pools
        const addressIn = tokenIn.address === NATIVE_TOKEN_ADDRESS ? contracts?.WETH : tokenIn.address;
        const addressOut = tokenOut.address === NATIVE_TOKEN_ADDRESS ? contracts?.WETH : tokenOut.address;
        if (!addressIn || !addressOut) return undefined;

        return allPoolsForChain.find(pool =>
            (pool.token0.address.toLowerCase() === addressIn.toLowerCase() && pool.token1.address.toLowerCase() === addressOut.toLowerCase()) ||
            (pool.token0.address.toLowerCase() === addressOut.toLowerCase() && pool.token1.address.toLowerCase() === addressIn.toLowerCase())
        );
    }, [tokenIn, tokenOut, allPoolsForChain, contracts]);


    // --- Transaction Simulations ---
    const simulateQuote = useCallback(async () => {
        if (!publicClient || !tokenIn || !tokenOut || !address || !contracts?.ROUTER || !contracts?.WETH || amountInBigInt <= 0 || !selectedPool || isApprovalNeeded) {
            setQuoteResult(null);
            return;
        }
        setIsQuoteFetching(true);
        setQuoteError(null);
        try {
            const quoteArgs = {
                tokenIn: (tokenIn.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenIn.address) as `0x${string}`,
                tokenOut: (tokenOut.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenOut.address) as `0x${string}`,
                fee: selectedPool.fee,
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                amountIn: amountInBigInt,
                amountOutMinimum: 0n,
                sqrtPriceLimitX96: 0n,
            };

            const { result } = await publicClient.simulateContract({
                address: contracts.ROUTER,
                abi: ROUTER_ABI,
                functionName: 'exactInputSingle',
                args: [quoteArgs],
                value: tokenIn.address === NATIVE_TOKEN_ADDRESS ? amountInBigInt : undefined,
                account: address,
            });
            setQuoteResult({ result });
        } catch (e) {
            console.error("Quote simulation failed:", e);
            setQuoteError(e as Error);
            setQuoteResult(null);
        } finally {
            setIsQuoteFetching(false);
        }
    }, [publicClient, tokenIn, tokenOut, address, contracts, amountInBigInt, selectedPool, isApprovalNeeded]);

    const simulateApprove = useCallback(async () => {
        if (!publicClient || !address || !tokenIn || tokenIn.address === NATIVE_TOKEN_ADDRESS || !contracts?.ROUTER || !isApprovalNeeded) {
             setApproveResult(null);
             return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                address: tokenIn.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [contracts.ROUTER, maxUint256],
                account: address,
            });
            setApproveResult({ request });
        } catch (e) {
            console.error("Approve simulation failed:", e);
            setApproveResult(null);
        }
    }, [publicClient, address, tokenIn, contracts, isApprovalNeeded]);
    
    const simulateSwap = useCallback(async () => {
         if (!publicClient || !tokenIn || !tokenOut || !address || !contracts?.ROUTER || !contracts?.WETH || amountInBigInt <= 0 || amountOutMinimum <= 0n || !selectedPool || isApprovalNeeded) {
            setSwapResult(null);
            return;
         }
         setSwapError(null);
         try {
             const swapArgs = {
                tokenIn: (tokenIn.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenIn.address) as `0x${string}`,
                tokenOut: (tokenOut.address === NATIVE_TOKEN_ADDRESS ? contracts.WETH : tokenOut.address) as `0x${string}`,
                fee: selectedPool.fee,
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                amountIn: amountInBigInt,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0n,
             };
            const { request } = await publicClient.simulateContract({
                address: contracts.ROUTER,
                abi: ROUTER_ABI,
                functionName: 'exactInputSingle',
                args: [swapArgs],
                value: tokenIn.address === NATIVE_TOKEN_ADDRESS ? amountInBigInt : undefined,
                account: address,
            });
            setSwapResult({ request });
         } catch(e) {
            console.error("Swap simulation failed:", e);
            setSwapError(e as Error);
            setSwapResult(null);
         }
    }, [publicClient, tokenIn, tokenOut, address, contracts, amountInBigInt, amountOutMinimum, selectedPool, isApprovalNeeded]);


    useEffect(() => { simulateQuote(); }, [simulateQuote]);
    useEffect(() => { simulateApprove(); }, [simulateApprove]);
    useEffect(() => { simulateSwap(); }, [simulateSwap]);

    const isRefreshing = isQuoteFetching || isBalanceInFetching || isBalanceOutFetching || isAllowanceFetching;

    const handleRefresh = useCallback(() => {
        if (isRefreshing) return;
        simulateQuote();
        fetchBalance(tokenIn, setBalanceIn, setIsBalanceInFetching);
        fetchBalance(tokenOut, setBalanceOut, setIsBalanceOutFetching);
        fetchAllowance();
    }, [isRefreshing, simulateQuote, fetchBalance, tokenIn, tokenOut, fetchAllowance]);

    const exchangeRate = useMemo(() => {
        const numAmountIn = parseFloat(amountIn);
        const numAmountOut = parseFloat(amountOut);
        if (numAmountIn > 0 && numAmountOut > 0) {
            return (numAmountOut / numAmountIn).toFixed(4);
        }
        return '...';
    }, [amountIn, amountOut]);

    useEffect(() => {
        if (tokenIn && tokenIn.address !== NATIVE_TOKEN_ADDRESS && typeof allowance === 'bigint' && amountInBigInt > 0) {
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
            } else {
                setAmountOut('0.0');
                setAmountOutMinimum(0n);
            }
        } else if (quoteError) {
             setAmountOut('0.0');
             setAmountOutMinimum(0n);
        }
    }, [quoteResult, tokenOut, slippage, quoteError]);

    useEffect(() => {
        if (amountInBigInt <= 0n) {
            setAmountOut('');
            setAmountOutMinimum(0n);
        }
    }, [amountInBigInt]);
    
    useEffect(() => {
        if (availableTokens.length > 0 && (!tokenIn || !tokenOut)) {
            setTokenIn(availableTokens.find(t => t.symbol === 'ETH') || availableTokens[0]);
            setTokenOut(availableTokens.find(t => t.symbol === 'USDC') || (availableTokens.length > 1 ? availableTokens[1] : availableTokens[0]));
        } else if (availableTokens.length === 0) {
            setTokenIn(null);
            setTokenOut(null);
        }
        setAmountIn('');
        setAmountOut('');
    }, [availableTokens, tokenIn, tokenOut]);
    
    // Reset tx states
    const resetTx = useCallback(() => {
        setTxHash(undefined);
        setIsTxPending(false);
        setIsTxConfirming(false);
        setIsTxSuccess(false);
    }, []);

    // Transaction success effect
    useEffect(() => {
        if (isTxSuccess) {
            fetchAllowance();
            resetTx();
        }
    }, [isTxSuccess, resetTx, fetchAllowance]);


    const handleTokenSelect = useCallback((token: Token) => {
        if (isSelectingFor === 'in') {
            if (token.address === tokenOut?.address) setTokenOut(tokenIn);
            setTokenIn(token);
        } else if (isSelectingFor === 'out') {
             if (token.address === tokenIn?.address) setTokenIn(tokenOut);
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
    
     const executeTransaction = useCallback(async (request: any) => {
        if (!walletClient || !request || !publicClient) return;
        
        resetTx();
        setIsTxPending(true);

        try {
            const hash = await walletClient.writeContract(request);
            setTxHash(hash);
            setIsTxPending(false);
            setIsTxConfirming(true);
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            setIsTxConfirming(false);
            if (receipt.status === 'success') {
                setIsTxSuccess(true);
            }
        } catch (error) {
            console.error("Transaction failed:", error);
            setIsTxPending(false);
            setIsTxConfirming(false);
        }
    }, [walletClient, publicClient, resetTx]);

    const handleApprove = () => {
        if (!approveResult?.request) return;
        executeTransaction(approveResult.request);
    };
    
    const handleSwap = () => {
        if (!swapResult?.request) return;
        executeTransaction(swapResult.request);
    }

    const getButtonText = () => {
        if (!isWalletConnected) return 'Connect Wallet';
        if (!isSupportedChain) return 'Unsupported Network';
        if (isTxPending) return 'Check Wallet...';
        if (isTxConfirming) return 'Transaction Confirming...';
        if (isApprovalNeeded) return `Approve ${tokenIn?.symbol}`;
        if (amountIn && !selectedPool) return 'No pool available';
        if (!amountIn || parseFloat(amountIn) <= 0) return 'Enter an amount';
        return 'Swap';
    };

    const isButtonDisabled = (
        !isWalletConnected ||
        !isSupportedChain ||
        isTxPending ||
        isTxConfirming ||
        (isApprovalNeeded && !approveResult?.request) ||
        (!isApprovalNeeded && (!amountIn || parseFloat(amountIn) <= 0 || !swapResult?.request || !selectedPool))
    );
    
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
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleRefresh} 
                            disabled={isRefreshing} 
                            className="text-brand-text-secondary hover:text-brand-text-primary transition-colors disabled:opacity-50 disabled:cursor-wait"
                            aria-label="Refresh rates and balances"
                        >
                            <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={() => setIsSettingsOpen(true)} 
                            className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
                             aria-label="Open settings"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <TokenInput
                        label="You pay"
                        token={tokenIn}
                        amount={amountIn}
                        onAmountChange={setAmountIn}
                        onTokenSelect={() => setIsSelectingFor('in')}
                        balance={balanceIn?.formatted}
                        isBalanceLoading={isWalletConnected && isBalanceInFetching}
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
                        isBalanceLoading={isWalletConnected && isBalanceOutFetching}
                        isOutput={true}
                    />
                </div>

                <div className="text-sm text-brand-text-secondary p-2 text-center h-6">
                   {isQuoteFetching ? (
                        <span className="inline-block w-48 h-4 bg-brand-surface-2 rounded animate-pulse align-middle" />
                   ) : (
                     amountIn && parseFloat(amountIn) > 0 && amountOut && `1 ${tokenIn.symbol} ≈ ${exchangeRate} ${tokenOut.symbol}`
                   )}
                </div>

                <button
                    onClick={isWalletConnected ? (isApprovalNeeded ? handleApprove : handleSwap) : () => open()}
                    disabled={isButtonDisabled}
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
