import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { sepolia, baseSepolia } from 'viem/chains';
import type { Token } from '../types';
import { TOKENS_BY_CHAIN, NATIVE_TOKEN_ADDRESS, POOLS_BY_CHAIN } from '../constants';
import { CONTRACT_ADDRESSES, ROUTER_ABI, ERC20_ABI } from '../config';
import { useDebounce } from '../hooks/useDebounce';
import { useAppKit } from '@reown/appkit/react';

import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SettingsModal from './SettingsModal';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { SettingsIcon } from './icons/SettingsIcon';


interface SwapCardProps {
    isWalletConnected: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected }) => {
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { open: openWalletModal } = useAppKit();

    const chainId = chain?.id ?? baseSepolia.id;
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

    useEffect(() => {
        console.log("SwapCard.tsx: Component successfully mounted.");
    }, []);

    useEffect(() => {
        // This effect ensures that when the network (and thus the available `tokens`) changes,
        // the selected tokens are reset to valid defaults for the new network.
        const tokenInIsValid = tokens.some(t => t.address.toLowerCase() === tokenIn?.address?.toLowerCase());
        const tokenOutIsValid = tokens.some(t => t.address.toLowerCase() === tokenOut?.address?.toLowerCase());
    
        // If either of the selected tokens is not valid for the current chain, reset them.
        if (!tokenInIsValid || !tokenOutIsValid) {
            if (tokens.length > 1) {
                setTokenIn(tokens[0]);
                setTokenOut(tokens[1]);
            } else if (tokens.length === 1) {
                setTokenIn(tokens[0]);
                setTokenOut({} as Token); // Use an empty object if there's no second token
            } else {
                setTokenIn({} as Token);
                setTokenOut({} as Token);
            }
            // Also reset amounts and errors to prevent stale state.
            setAmountIn('');
            setAmountOut('');
            setError(null);
        }
    }, [tokens, tokenIn, tokenOut]);

    useEffect(() => {
        const getQuote = async () => {
            if (!publicClient || !debouncedAmountIn || parseFloat(debouncedAmountIn) <= 0 || !tokenIn?.address || !tokenOut?.address || !chain) {
                setAmountOut('');
                return;
            }

            setIsQuoteLoading(true);
            setError(null);
            try {
                const amountInParsed = parseUnits(debouncedAmountIn, tokenIn.decimals);
                const routerAddress = CONTRACT_ADDRESSES[chain.id]?.ROUTER;

                if (!routerAddress) {
                    throw new Error(`Router address not found for chain ${chain.id}`);
                }
                
                const pool = pools.find(p => 
                    (p.token0.address.toLowerCase() === tokenIn.address.toLowerCase() && p.token1.address.toLowerCase() === tokenOut.address.toLowerCase()) ||
                    (p.token0.address.toLowerCase() === tokenOut.address.toLowerCase() && p.token1.address.toLowerCase() === tokenIn.address.toLowerCase())
                );
                
                if (!pool) {
                    setError("No pool available for this pair.");
                    setAmountOut('');
                    setIsQuoteLoading(false);
                    return;
                }

                const swapParams = {
                    tokenIn: tokenIn.address as `0x${string}`,
                    tokenOut: tokenOut.address as `0x${string}`,
                    fee: pool.fee,
                    recipient: address || '0x0000000000000000000000000000000000000000',
                    deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
                    amountIn: amountInParsed,
                    amountOutMinimum: 0n,
                    sqrtPriceLimitX96: 0n,
                };
                
                const { result: quotedAmountOut } = await publicClient.simulateContract({
                    account: address || '0x0000000000000000000000000000000000000000',
                    address: routerAddress,
                    abi: ROUTER_ABI,
                    functionName: 'exactInputSingle',
                    args: [swapParams],
                    value: tokenIn.address === NATIVE_TOKEN_ADDRESS ? amountInParsed : 0n,
                });
                
                setAmountOut(formatUnits(quotedAmountOut as bigint, tokenOut.decimals));

            } catch (err) {
                console.error("Failed to get quote:", err);
                setAmountOut('');
                setError("Could not fetch a quote. The pool may have low liquidity.");
            } finally {
                setIsQuoteLoading(false);
            }
        };

        getQuote();
    }, [debouncedAmountIn, tokenIn, tokenOut, publicClient, address, chain, pools]);

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

    const handleSwap = async () => {
        if (!walletClient || !address || !chain || !publicClient || !amountOut || isQuoteLoading) return;

        setError(null);
        
        try {
            const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
            const routerAddress = CONTRACT_ADDRESSES[chain.id]?.ROUTER;
            
            const pool = pools.find(p => 
                (p.token0.address.toLowerCase() === tokenIn.address.toLowerCase() && p.token1.address.toLowerCase() === tokenOut.address.toLowerCase()) ||
                (p.token0.address.toLowerCase() === tokenOut.address.toLowerCase() && p.token1.address.toLowerCase() === tokenIn.address.toLowerCase())
            );

            if (!pool) {
                setError("No liquidity pool found for this pair.");
                return;
            }
            
            if (tokenIn.address !== NATIVE_TOKEN_ADDRESS) {
                setIsApproving(true);
                 // FIX: Cast to any to work around a deep type instantiation issue in viem.
                 const allowance = await publicClient.readContract({
                    address: tokenIn.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [address, routerAddress],
                } as any);

                // FIX: Cast allowance to bigint as readContract result is unknown due to `as any`.
                if ((allowance as bigint) < amountInParsed) {
                    // FIX: Add chain parameter to writeContract call.
                    // FIX: Add account to writeContract call.
                    const approveTx = await walletClient.writeContract({
                        address: tokenIn.address as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [routerAddress, amountInParsed],
                        chain,
                        account: address,
                    });
                    await publicClient.waitForTransactionReceipt({ hash: approveTx });
                }
                setIsApproving(false);
            }

            setIsSwapping(true);
            const amountOutParsed = parseUnits(amountOut, tokenOut.decimals);
            const slippageTolerance = BigInt(10000 - Math.floor(slippage * 100)); // e.g. 0.5% -> 9950
            const amountOutMinimum = (amountOutParsed * slippageTolerance) / 10000n;


            // FIX: Ensure deadline and sqrtPriceLimitX96 are bigints.
            const swapParams = {
                tokenIn: tokenIn.address as `0x${string}`,
                tokenOut: tokenOut.address as `0x${string}`,
                fee: pool.fee,
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes from now
                amountIn: amountInParsed,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0n,
            };

            // FIX: Add chain parameter to writeContract call.
            // FIX: Add account to writeContract call.
            const swapTx = await walletClient.writeContract({
                address: routerAddress,
                abi: ROUTER_ABI,
                functionName: 'exactInputSingle',
                args: [swapParams],
                value: tokenIn.address === NATIVE_TOKEN_ADDRESS ? amountInParsed : 0n,
                chain,
                account: address,
            });
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
        !amountOut ||
        isQuoteLoading ||
        isApproving || 
        isSwapping || 
        parseFloat(amountIn) > parseFloat(balanceIn?.formatted || '0')
    );

    const buttonText = () => {
        if (!isWalletConnected) return 'Connect Wallet';
        if (isQuoteLoading) return 'Fetching price...';
        if (isApproving) return 'Approving...';
        if (isSwapping) return 'Swapping...';
        if (!amountIn) return 'Enter an amount';
        if (parseFloat(amountIn) > 0 && !amountOut && !error) return 'Getting quote...';
        if (parseFloat(amountIn) > parseFloat(balanceIn?.formatted || '0')) return `Insufficient ${tokenIn?.symbol} balance`;
        return 'Swap';
    };

    // FIX: The `openWalletModal` function is not directly compatible with the `onClick` event handler type.
    // It is wrapped in an arrow function to ensure it's called correctly without arguments when the button is clicked.
    const handleButtonClick = isWalletConnected ? handleSwap : () => openWalletModal();

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Swap</h2>
                <button onClick={() => setSettingsOpen(true)} className="text-brand-text-secondary hover:text-brand-text-primary">
                    <SettingsIcon className="w-6 h-6" />
                </button>
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
                    isQuoteLoading={isQuoteLoading}
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