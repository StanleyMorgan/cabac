import React, { useState } from 'react';
import type { Position } from './MyPositions';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES, POSITION_MANAGER_ABI } from '../config';

interface RemoveLiquidityCardProps {
  position: Position;
  onBack: () => void;
}


const RemoveLiquidityCard: React.FC<RemoveLiquidityCardProps> = ({ position, onBack }) => {
    const { address, chain, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const [percentage, setPercentage] = useState(50);
    const [status, setStatus] = useState<'idle' | 'removing' | 'collecting'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleRemoveLiquidity = async () => {
        if (!walletClient || !address || !chain) return;

        setError(null);
        setStatus('removing');

        try {
            const positionManagerAddress = CONTRACT_ADDRESSES[chain.id]?.POSITION_MANAGER;
            if (!positionManagerAddress) throw new Error("Position Manager contract not found.");
            
            const liquidityToRemove = (position.liquidity * BigInt(percentage)) / 100n;

            // 1. Decrease Liquidity
            const decreaseParams = {
                tokenId: position.id,
                liquidity: liquidityToRemove,
                amount0Min: 0n,
                amount1Min: 0n,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            };
            const decreaseTx = await walletClient.writeContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'decreaseLiquidity',
                args: [decreaseParams],
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: decreaseTx });

            // 2. Collect Tokens
            setStatus('collecting');
            const collectParams = {
                tokenId: position.id,
                recipient: address,
                amount0Max: 2n**128n - 1n, // type(uint128).max
                amount1Max: 2n**128n - 1n,
            };
            const collectTx = await walletClient.writeContract({
                address: positionManagerAddress,
                abi: POSITION_MANAGER_ABI,
                functionName: 'collect',
                args: [collectParams],
                chain,
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash: collectTx });

            setStatus('idle');
            onBack();

        } catch (err: any) {
            console.error(err);
            setError(err.shortMessage || "An error occurred while removing liquidity.");
            setStatus('idle');
        }
    };

    const isButtonDisabled = status !== 'idle' || !isConnected;

    const buttonText = () => {
        if (!isConnected) return "Connect Wallet";
        switch (status) {
            case 'removing': return "Decreasing Liquidity...";
            case 'collecting': return "Collecting Tokens...";
            default: return "Remove Liquidity";
        }
    };

  return (
    <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
                <h2 className="text-xl font-bold">Remove Liquidity</h2>
                <p className="text-sm text-brand-text-secondary">{position.token0.symbol}/{position.token1.symbol} (NFT #{position.id.toString()})</p>
            </div>
        </div>

        <div className="text-center my-8">
            <p className="text-6xl font-mono text-brand-text-primary">{percentage}%</p>
            <p className="text-brand-text-secondary mt-2">Amount to remove</p>
        </div>

        <div className="my-6">
            <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full h-2 bg-brand-secondary rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
             <div className="flex justify-between mt-2 text-xs text-brand-text-secondary">
                <span>0%</span>
                <span>100%</span>
            </div>
        </div>

        <div className="flex justify-center space-x-2 my-6">
            {[25, 50, 75, 100].map(val => (
                <button
                    key={val}
                    onClick={() => setPercentage(val)}
                    className={`py-1 px-4 rounded-lg text-sm font-semibold transition-colors ${percentage === val ? 'bg-brand-primary text-white' : 'bg-brand-secondary hover:bg-gray-700'}`}
                >
                    {val}%
                </button>
            ))}
        </div>
        
        <div className="mt-6">
            <button
                onClick={handleRemoveLiquidity}
                disabled={isButtonDisabled}
                className="w-full bg-brand-accent hover:opacity-90 text-white font-bold py-4 px-4 rounded-xl transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {buttonText()}
            </button>
            {error && <p className="text-brand-accent text-sm mt-3 text-center">{error}</p>}
        </div>
    </div>
  );
};

export default RemoveLiquidityCard;