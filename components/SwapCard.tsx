import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { Token } from '../types';
import { TOKENS_BY_CHAIN, NATIVE_TOKEN_ADDRESS, POOLS_BY_CHAIN } from '../constants';
import { CONTRACT_ADDRESSES, ROUTER_ABI, ERC20_ABI, WETH_ABI, QUOTER_V2_ABI } from '../config';
import { useDebounce } from '../hooks/useDebounce';
import { useAppKit } from '@reown/appkit/react';

import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SettingsModal from './SettingsModal';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { SettingsIcon } from './icons/SettingsIcon';

const MAX_UINT256 = 2n**256n - 1n;

interface SwapCardProps {
    isWalletConnected: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected }) => {
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { open: openWalletModal } = useAppKit();

    const chainId = chain?.id ?? base.id;
    const tokens = useMemo(() => TOKENS_BY_CHAIN[chainId] || [], [chainId]);
    const pools = useMemo(() => POOLS_BY_CHAIN[chainId] || [], [chainId]);

    const [tokenIn, setTokenIn] = useState<Token>(tokens[0] || {} as Token);
    const [tokenOut, setTokenOut] = useState<Token>(tokens[1] || {} as Token);
    
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');
    const debouncedAmountIn = useDebounce(amountIn, 500);

    const [isTokenSelectorOpen, setTokenSelectorOpen] = useState(false);
    const [selectingFor, setSelectingFor] = useState<'in' | 'out'>('in');
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
    
    const [isApproving, setIsApproving] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [needsApproval, setNeedsApproval] = useState(false);
    const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

    const { data: balanceIn, isLoading: isBalanceInLoading, refetch: refetchBalanceIn } = useBalance({
        address,
        token: tokenIn.address === NATIVE_TOKEN_ADDRESS ? undefined : tokenIn.address as `0x${string}`,
        chainId: chainId,
    });
     const { data: balanceOut, isLoading: isBalanceOutLoading, refetch: refetchBalanceOut } = useBalance({
        address,
        token: tokenOut.address === NATIVE_TOKEN_ADDRESS ? undefined : tokenOut.address as `0x${string}`,
        chainId: chainId,
    });

    const isWrapping = useMemo(() => {
        const wethAddress = CONTRACT_ADDRESSES[chainId]?.WETH;
        if (!wethAddress || !tokenIn?.address || !tokenOut?.address) return false;
        return tokenIn.address === NATIVE_TOKEN_ADDRESS && tokenOut.address.toLowerCase() === wethAddress.toLowerCase();
    }, [tokenIn, tokenOut, chainId]);

    const isUnwrapping = useMemo(() => {
        const wethAddress = CONTRACT_ADDRESSES[chainId]?.WETH;
        if (!wethAddress || !tokenIn?.address || !tokenOut?.address) return false;
        return tokenIn.address.toLowerCase() === wethAddress.toLowerCase() && tokenOut.address === NATIVE_TOKEN_ADDRESS;
    }, [tokenIn, tokenOut, chainId]);

    useEffect(() => {
        console.log("SwapCard.tsx: Component successfully mounted.");
    }, []);

    useEffect(() => {
        const tokenInIsValid = tokens.some(t => t.address.toLowerCase() === tokenIn?.address?.toLowerCase());
        const tokenOutIsValid = tokens.some(t => t.address.toLowerCase() === tokenOut?.address?.toLowerCase());
    
        if (!tokenInIsValid || !tokenOutIsValid || !tokens.length) {
            console.log(`%c[SWAP_CARD] Chain Changed to: ${chainId}`, 'color: cyan; font-weight: bold;');
            console.log('[SWAP_CARD] Tokens for this chain:', tokens);
            console.log('[SWAP_CARD] Pools for this chain:', pools);
            
            if (tokens.length > 1) {
                setTokenIn(tokens[0]);
                setTokenOut(tokens[1]);
            } else if (tokens.length === 1) {
                setTokenIn(tokens[0]);
                setTokenOut({} as Token);
            } else {
                setTokenIn({} as Token);
                setTokenOut({} as Token);
            }
            setAmountIn('');
            setAmountOut('');
            setError(null);
        }
    }, [tokens, tokenIn, tokenOut, chainId, pools]);

    // Effect to fetch quote using QuoterV2, independent of allowance
    useEffect(() => {
        const getQuote = async () => {
            setAmountOut('');
            // Only clear the error if we are not in a state that requires user action (approval)
            if (!needsApproval) {
                setError(null);
            }
            
            if (isWrapping || isUnwrapping) {
                setAmountOut(debouncedAmountIn);
                return;
            }

            if (!publicClient || !debouncedAmountIn || parseFloat(debouncedAmountIn) <= 0 || !tokenIn?.address || !tokenOut?.address || !chain) {
                return;
            }

            setIsQuoteLoading(true);
            try {
                const quoterAddress = CONTRACT_ADDRESSES[chain.id]?.QUOTER_V2;
                if (!quoterAddress) {
                    throw new Error(`QuoterV2 address not found for chain ${chain.id}`);
                }
                
                const amountInParsed = parseUnits(debouncedAmountIn, tokenIn.decimals);
                const pool = pools.find(p => 
                    (p.token0.address.toLowerCase() === tokenIn.address.toLowerCase() && p.token1.address.toLowerCase() === tokenOut.address.toLowerCase()) ||
                    (p.token0.address.toLowerCase() === tokenOut.address.toLowerCase() && p.token1.address.toLowerCase() === tokenIn.address.toLowerCase())
                );
                
                if (!pool) {
                    throw new Error("No pool available for this pair.");
                }

                // FIX: Use `simulateContract` for `nonpayable` quote functions as recommended by `viem`'s strict typing.
                // `readContract` is intended for `view` or `pure` functions, causing type errors with the QuoterV2 ABI.
                const { result: quotedAmountOut } = await publicClient.simulateContract({
                    address: quoterAddress,
                    abi: QUOTER_V2_ABI,
                    functionName: 'quoteExactInputSingle',
                    args: [{
                        tokenIn: tokenIn.address as `0x${string}`,
                        tokenOut: tokenOut.address as `0x${string}`,
                        amountIn: amountInParsed,
                        fee: pool.fee,
                        sqrtPriceLimitX96: 0n,
                    }]
                });

                // QuoterV2 returns a tuple (amountOut, ...), so we take the first element.
                // The `result` from `simulateContract` is correctly typed, so `as bigint` is not needed.
                const amountOutFormatted = formatUnits(quotedAmountOut[0], tokenOut.decimals);
                setAmountOut(amountOutFormatted);

            } catch (err: any) {
                console.error("%c[SWAP_CARD] Failed to get quote from QuoterV2. Full error object:", 'color: red; font-weight: bold;', err);
                 if (err.message?.includes("No pool available")) {
                     setError("No pool available for this pair.");
                } else {
                     setError("Could not fetch a quote. The pool may have low liquidity.");
                }
            } finally {
                setIsQuoteLoading(false);
            }
        };

        getQuote();
    }, [debouncedAmountIn, tokenIn, tokenOut, publicClient, chain, pools, isWrapping, isUnwrapping, needsApproval]);


    // Effect to check allowance
    useEffect(() => {
        const checkAllowance = async () => {
            if (!isWalletConnected || !address || !chain || !publicClient || !debouncedAmountIn || parseFloat(debouncedAmountIn) <= 0 || tokenIn.address === NATIVE_TOKEN_ADDRESS) {
                setNeedsApproval(false);
                return;
            }

            setIsCheckingAllowance(true);
            try {
                const routerAddress = CONTRACT_ADDRESSES[chain.id]?.ROUTER;
                if (routerAddress) {
                    const amountInParsed = parseUnits(debouncedAmountIn, tokenIn.decimals);
                    const allowance = await publicClient.readContract({
                        address: tokenIn.address as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'allowance',
                        args: [address, routerAddress],
                    } as any);
                    setNeedsApproval((allowance as bigint) < amountInParsed);
                } else {
                    setNeedsApproval(false);
                }
            } catch (e) {
                console.error("Failed to check allowance:", e);
                setNeedsApproval(false);
            } finally {
                setIsCheckingAllowance(false);
            }
        };

        checkAllowance();
    }, [debouncedAmountIn, tokenIn, address, chain, isWalletConnected, publicClient]);


    const handleTokenSelect = (token: Token) => {
        if (selectingFor === 'in') {
            if (token.address === tokenOut.address) {
                setTokenOut(tokenIn);
            }
            setTokenIn(token);
        } else {
            if (token.address === tokenIn.address) {
                setTokenIn(tokenOut);
            }
            setTokenOut(token);
        }
        setAmountIn('');
        setAmountOut('');
        setTokenSelectorOpen(false);
    };

    const handleSwapTokens = () => {
        setTokenIn(tokenOut);
        setTokenOut(tokenIn);
        setAmountIn(amountOut);
        setAmountOut(amountIn);
    };

    const handleWrap = async () => {
        if (!walletClient || !address || !chain || !amountIn) return;
        setError(null);
        setIsSwapping(true);
        try {
            const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
            const wethAddress = CONTRACT_ADDRESSES[chain.id].WETH;

            const wrapTx = await walletClient.writeContract({
                address: wethAddress,
                abi: WETH_ABI,
                functionName: 'deposit',
                value: amountInParsed,
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: wrapTx });

            refetchBalanceIn();
            refetchBalanceOut();
            setAmountIn('');
            setAmountOut('');
        } catch (err: any) {
            console.error(err);
            setError(err.shortMessage || "An error occurred during wrapping.");
        } finally {
            setIsSwapping(false);
        }
    };

    const handleUnwrap = async () => {
        if (!walletClient || !address || !chain || !amountIn) return;
        setError(null);
        setIsSwapping(true);
        try {
            const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
            const wethAddress = CONTRACT_ADDRESSES[chain.id].WETH;

            const unwrapTx = await walletClient.writeContract({
                address: wethAddress,
                abi: WETH_ABI,
                functionName: 'withdraw',
                args: [amountInParsed],
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: unwrapTx });

            refetchBalanceIn();
            refetchBalanceOut();
            setAmountIn('');
            setAmountOut('');
        } catch (err: any) {
            console.error(err);
            setError(err.shortMessage || "An error occurred during unwrapping.");
        } finally {
            setIsSwapping(false);
        }
    };

    const handleApprove = async () => {
        if (!walletClient || !address || !chain || !tokenIn?.address || !publicClient) return;
        
        setIsApproving(true);
        setError(null);
        try {
            const routerAddress = CONTRACT_ADDRESSES[chain.id]?.ROUTER;
            if (!routerAddress) throw new Error("Router address not found");

            const approveTx = await walletClient.writeContract({
                address: tokenIn.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [routerAddress, MAX_UINT256],
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: approveTx });
            
            // Re-check allowance, should now be sufficient
            setNeedsApproval(false);

        } catch (err: any) {
             console.error(err);
            setError(err.shortMessage || "An error occurred during approval.");
        } finally {
            setIsApproving(false);
        }
    };

    const handleSwap = async () => {
        if (!walletClient || !address || !chain || !publicClient || !amountOut || isQuoteLoading) return;

        setError(null);
        setIsSwapping(true);
        
        try {
            const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
            const routerAddress = CONTRACT_ADDRESSES[chain.id]?.ROUTER;
            
            const pool = pools.find(p => 
                (p.token0.address.toLowerCase() === tokenIn.address.toLowerCase() && p.token1.address.toLowerCase() === tokenOut.address.toLowerCase()) ||
                (p.token0.address.toLowerCase() === tokenOut.address.toLowerCase() && p.token1.address.toLowerCase() === tokenIn.address.toLowerCase())
            );

            if (!pool) {
                setError("No liquidity pool found for this pair.");
                setIsSwapping(false);
                return;
            }
            
            const amountOutParsed = parseUnits(amountOut, tokenOut.decimals);
            const slippageTolerance = BigInt(10000 - Math.floor(slippage * 100));
            const amountOutMinimum = (amountOutParsed * slippageTolerance) / 10000n;

            const swapParams = {
                tokenIn: tokenIn.address as `0x${string}`,
                tokenOut: tokenOut.address as `0x${string}`,
                fee: pool.fee,
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                amountIn: amountInParsed,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0n,
            };

            // We must use simulateContract here before swapping to validate the transaction
            const { request } = await publicClient.simulateContract({
                account: address,
                address: routerAddress,
                abi: ROUTER_ABI,
                functionName: 'exactInputSingle',
                args: [swapParams],
                value: tokenIn.address === NATIVE_TOKEN_ADDRESS ? amountInParsed : 0n,
            });

            const swapTx = await walletClient.writeContract(request);

            await publicClient.waitForTransactionReceipt({ hash: swapTx });
            
            refetchBalanceIn();
            refetchBalanceOut();
            setAmountIn('');
            setAmountOut('');

        } catch (err: any) {
            console.error(err);
            setError(err.shortMessage || "An error occurred during the swap.");
        } finally {
            setIsApproving(false);
            setIsSwapping(false);
        }
    };


    const isButtonDisabled = isWalletConnected && (
        !amountIn || 
        isQuoteLoading ||
        isApproving || 
        isSwapping || 
        isCheckingAllowance ||
        parseFloat(amountIn) > parseFloat(balanceIn?.formatted || '0') ||
        (!(isWrapping || isUnwrapping) && !amountOut && !needsApproval && parseFloat(amountIn) > 0)
    );

    const buttonText = () => {
        if (!isWalletConnected) return 'Connect Wallet';
        if (!amountIn) return 'Enter an amount';
        if (parseFloat(amountIn) > parseFloat(balanceIn?.formatted || '0')) return `Insufficient ${tokenIn?.symbol} balance`;
        
        if (isCheckingAllowance) return 'Checking allowance...';
        if (needsApproval) return `Approve ${tokenIn.symbol}`;
        if (isApproving) return 'Approving...';
        
        if (isWrapping) return isSwapping ? 'Wrapping...' : 'Wrap';
        if (isUnwrapping) return isSwapping ? 'Unwrapping...' : 'Unwrap';
        
        if (isQuoteLoading) return 'Fetching price...';
        if (isSwapping) return 'Swapping...';
        if (parseFloat(amountIn) > 0 && !amountOut && !error) return 'Getting quote...';
        return 'Swap';
    };

    const handleButtonClick = () => {
        if (!isWalletConnected) {
            openWalletModal();
            return;
        }
        if (needsApproval) {
            handleApprove();
            return;
        }
        if (isWrapping) {
            handleWrap();
        } else if (isUnwrapping) {
            handleUnwrap();
        } else {
            handleSwap();
        }
    };

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Swap</h2>
                {!(isWrapping || isUnwrapping) && (
                    <button onClick={() => setSettingsOpen(true)} className="text-brand-text-secondary hover:text-brand-text-primary">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <div className="relative">
                <TokenInput
                    label="You pay"
                    token={tokenIn}
                    amount={amountIn}
                    onAmountChange={(val) => { setAmountIn(val); setError(null); }}
                    onTokenSelect={() => { setSelectingFor('in'); setTokenSelectorOpen(true); }}
                    balance={balanceIn?.formatted}
                    isBalanceLoading={isBalanceInLoading}
                />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-brand-surface rounded-full border-4 border-brand-surface">
                    <button onClick={handleSwapTokens} className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-brand-text-primary hover:bg-brand-primary transition-colors">
                        <ArrowDownIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <TokenInput
                    label="You receive"
                    token={tokenOut}
                    amount={amountOut}
                    onAmountChange={setAmountOut}
                    onTokenSelect={() => { setSelectingFor('out'); setTokenSelectorOpen(true); }}
                    balance={balanceOut?.formatted}
                    isBalanceLoading={isBalanceOutLoading}
                    isOutput={true}
                    isQuoteLoading={isQuoteLoading && !isWrapping && !isUnwrapping}
                />
            </div>
            <button
                onClick={handleButtonClick}
                disabled={isButtonDisabled}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-4 px-4 rounded-xl mt-4 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {buttonText()}
            </button>
             {error && <p className="text-brand-accent text-sm mt-3 text-center">{error}</p>}

            <TokenSelectorModal
                isOpen={isTokenSelectorOpen}
                onClose={() => setTokenSelectorOpen(false)}
                onSelectToken={handleTokenSelect}
                tokens={tokens}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                slippage={slippage}
                setSlippage={setSlippage}
            />
        </div>
    );
};

export default SwapCard;
