
import React, { useState, useEffect, useCallback } from 'react';
import { Token } from '../types';
import { TOKENS } from '../constants';
import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SettingsModal from './SettingsModal';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { SwapIcon } from './icons/SwapIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SwapCardProps {
    isWalletConnected: boolean;
    onConnectWallet: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ isWalletConnected, onConnectWallet }) => {
    const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
    const [tokenOut, setTokenOut] = useState<Token>(TOKENS[2]);
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');
    const [isSelectingFor, setIsSelectingFor] = useState<'in' | 'out' | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState(0.5);
    const [mockExchangeRate, setMockExchangeRate] = useState(3000);

    useEffect(() => {
        // Simulate fetching a new exchange rate when tokens change
        setMockExchangeRate(Math.random() * 5000 + 1000); 
    }, [tokenIn, tokenOut]);

    useEffect(() => {
        if (amountIn && parseFloat(amountIn) > 0) {
            const calculatedAmountOut = parseFloat(amountIn) * mockExchangeRate;
            setAmountOut(calculatedAmountOut.toFixed(4));
        } else {
            setAmountOut('');
        }
    }, [amountIn, mockExchangeRate]);

    const handleTokenSelect = useCallback((token: Token) => {
        if (isSelectingFor === 'in') {
            if (token.symbol === tokenOut.symbol) {
                setTokenOut(tokenIn);
            }
            setTokenIn(token);
        } else if (isSelectingFor === 'out') {
             if (token.symbol === tokenIn.symbol) {
                setTokenIn(tokenOut);
            }
            setTokenOut(token);
        }
        setIsSelectingFor(null);
    }, [isSelectingFor, tokenIn, tokenOut]);

    const handleSwapTokens = useCallback(() => {
        setTokenIn(tokenOut);
        setTokenOut(tokenIn);
        setAmountIn(amountOut);
        // Recalculate based on new direction
        if (amountOut && parseFloat(amountOut) > 0) {
            const calculatedAmountIn = parseFloat(amountOut) / mockExchangeRate;
            setAmountOut(calculatedAmountIn.toFixed(4));
        } else {
             setAmountOut('');
        }

    }, [tokenIn, tokenOut, amountOut, mockExchangeRate]);
    
    const handleSwap = () => {
        alert(`Swapping ${amountIn} ${tokenIn.symbol} for ~${amountOut} ${tokenOut.symbol} with ${slippage}% slippage.\n(This is a simulation)`);
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
                        balance={10.5} // Mock balance
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
                        onAmountChange={setAmountOut}
                        onTokenSelect={() => setIsSelectingFor('out')}
                        balance={25000} // Mock balance
                        isOutput={true}
                    />
                </div>

                 <div className="text-sm text-brand-text-secondary p-2 text-center">
                    1 {tokenIn.symbol} ≈ {mockExchangeRate.toFixed(2)} {tokenOut.symbol}
                </div>

                {isWalletConnected ? (
                     <button
                        onClick={handleSwap}
                        disabled={!amountIn || parseFloat(amountIn) <= 0}
                        className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-4"
                     >
                        Swap
                     </button>
                ) : (
                    <button
                        onClick={onConnectWallet}
                        className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover transition-all mt-4"
                     >
                        Connect Wallet
                     </button>
                )}
            </div>

            {isSelectingFor && (
                <TokenSelectorModal
                    isOpen={!!isSelectingFor}
                    onClose={() => setIsSelectingFor(null)}
                    onSelectToken={handleTokenSelect}
                    currentTokenIn={tokenIn}
                    currentTokenOut={tokenOut}
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

