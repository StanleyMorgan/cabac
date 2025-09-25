import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Pool, Token } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { parseUnits, maxUint256, BaseError } from 'viem';
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
 * Converts a price to a tick, rounding to the nearest tick spacing.
 * @param price The price of token0 in terms of token1.
 * @param token0 The first token.
 * @param token1 The second token.
 * @param tickSpacing The tick spacing of the pool.
 * @returns The rounded tick.
 */
const priceToTick = (price: number, token0: Token, token1: Token, tickSpacing: number): number => {
    const adjustedPrice = price * (10 ** (token1.decimals - token0.decimals));
    const rawTick = Math.log(adjustedPrice) / Math.log(1.0001);
    if (tickSpacing === 0) return Math.floor(rawTick);
    return Math.floor(rawTick / tickSpacing) * tickSpacing;
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
    const { address, isConnected, chain } = useAccount();
    const chainId = chain?.id;
    const { token0, token1 } = pool;

    const displayChainId = chainId || baseSepolia.id;

    const publicClient = usePublicClient({ chainId: displayChainId });
    const { data: walletClient } = useWalletClient({ chainId: displayChainId });

    const contracts = useMemo(() => chainId ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] : undefined, [chainId]);

    // State for user inputs
    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const [priceLower, setPriceLower] = useState('');
    const [priceUpper, setPriceUpper] = useState('');

    // State for approvals
    const [isApproval0Needed, setIsApproval0Needed] = useState(false);
    const [isApproval1Needed, setIsApproval1Needed] = useState(false);
    
    // State for transactions
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [isTxPending, setIsTxPending] = useState(false);
    const [isTxConfirming, setIsTxConfirming] = useState(false);
    const [isTxSuccess, setIsTxSuccess] = useState(false);

    // --- Data fetching states ---
    const [slot0, setSlot0] = useState<readonly [bigint, number, number, number, number, number, boolean] | undefined>();
    const [isSlot0Loading, setIsSlot0Loading] = useState(false);
    const [tickSpacing, setTickSpacing] = useState<number>(0);
    const [allowance0, setAllowance0] = useState<bigint | undefined>();
    const [allowance1, setAllowance1] = useState<bigint | undefined>();
    const [approve0Result, setApprove0Result] = useState<{ request: any } | null>(null);
    const [approve1Result, setApprove1Result] = useState<{ request: any } | null>(null);
    const [mintResult, setMintResult] = useState<{ request: any } | null>(null);
    const [mintError, setMintError] = useState<Error | null>(null);

    // Fetch pool data
    useEffect(() => {
        if (!publicClient) return;
        setIsSlot0Loading(true);
        // FIX: Added authorizationList. This seems to be required by a recent version of viem/wagmi.
        publicClient.readContract({
            address: pool.address as `0x${string}`,
            abi: POOL_ABI,
            functionName: 'slot0',
            // @ts-ignore - viem/wagmi typing issue with Celo support
            authorizationList: [],
        }).then(setSlot0).catch(console.error).finally(() => setIsSlot0Loading(false));

        // FIX: Added authorizationList. This seems to be required by a recent version of viem/wagmi.
        publicClient.readContract({
            address: pool.address as `0x${string}`,
            abi: POOL_ABI,
            functionName: 'tickSpacing',
            // @ts-ignore - viem/wagmi typing issue with Celo support
            authorizationList: [],
        }).then(res => setTickSpacing(Number(res))).catch(console.error);
    }, [publicClient, pool.address]);

    const fetchAllowances = useCallback(async () => {
        if (!publicClient || !address || !contracts?.POSITION_MANAGER) return;
        try {
            const [res0, res1] = await Promise.all([
                // FIX: Added authorizationList. This seems to be required by a recent version of viem/wagmi.
                publicClient.readContract({
                    address: token0.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [address, contracts.POSITION_MANAGER],
                    // @ts-ignore - viem/wagmi typing issue with Celo support
                    authorizationList: [],
                }),
                // FIX: Added authorizationList. This seems to be required by a recent version of viem/wagmi.
                publicClient.readContract({
                    address: token1.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'allowance',
                    args: [address, contracts.POSITION_MANAGER],
                    // @ts-ignore - viem/wagmi typing issue with Celo support
                    authorizationList: [],
                })
            ]);
            setAllowance0(res0);
            setAllowance1(res1);
        } catch (e) {
            console.error("Failed to fetch allowances", e);
        }
    }, [publicClient, address, contracts, token0, token1]);

    useEffect(() => {
        if (isConnected) {
            fetchAllowances();
        }
    }, [isConnected, fetchAllowances]);
    
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
    const tickLower = useMemo(() => priceLower ? priceToTick(parseFloat(priceLower), token0, token1, tickSpacing) : 0, [priceLower, token0, token1, tickSpacing]);
    const tickUpper = useMemo(() => priceUpper ? priceToTick(parseFloat(priceUpper), token0, token1, tickSpacing) : 0, [priceUpper, token0, token1, tickSpacing]);

    useEffect(() => {
        setIsApproval0Needed(!!allowance0 && allowance0 < amount0BigInt);
        setIsApproval1Needed(!!allowance1 && allowance1 < amount1BigInt);
    }, [allowance0, allowance1, amount0BigInt, amount1BigInt]);

    const resetTx = useCallback(() => {
        setTxHash(undefined);
        setIsTxPending(false);
        setIsTxConfirming(false);
        setIsTxSuccess(false);
    }, []);

    useEffect(() => {
        if (isTxSuccess) {
            fetchAllowances(); // Re-fetch allowances after a successful transaction
            resetTx();
        }
    }, [isTxSuccess, resetTx, fetchAllowances]);

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

    // --- Simulations ---
    const simulateApprove = useCallback(async (token: Token, setResult: Function) => {
        if (!publicClient || !address || !contracts?.POSITION_MANAGER) {
             setResult(null);
             return;
        }
        try {
            const { request } = await publicClient.simulateContract({
                address: token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [contracts.POSITION_MANAGER, maxUint256],
                account: address as `0x${string}`,
            });
            setResult({ request });
        } catch (e) {
            console.error(`Approve simulation failed for ${token.symbol}:`, e);
            setResult(null);
        }
    }, [publicClient, address, contracts]);

    useEffect(() => { if (isApproval0Needed) simulateApprove(token0, setApprove0Result); else setApprove0Result(null); }, [isApproval0Needed, simulateApprove, token0]);
    useEffect(() => { if (isApproval1Needed) simulateApprove(token1, setApprove1Result); else setApprove1Result(null); }, [isApproval1Needed, simulateApprove, token1]);

    const simulateMint = useCallback(async () => {
        if (!publicClient || !address || !contracts?.POSITION_MANAGER || isApproval0Needed || isApproval1Needed || amount0BigInt <= 0n || amount1BigInt <= 0n || tickLower >= tickUpper) {
            setMintResult(null);
            return;
        }
        setMintError(null);
        try {
            const mintParams = {
                token0: token0.address as `0x${string}`,
                token1: token1.address as `0x${string}`,
                fee: pool.fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0BigInt,
                amount1Desired: amount1BigInt,
                amount0Min: 0n, // Simplification: we're not calculating this
                amount1Min: 0n, // Simplification: we're not calculating this
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            };
            const { request } = await publicClient.simulateContract({
                address: contracts.POSITION_MANAGER,
                abi: POSITION_MANAGER_ABI,
                functionName: 'mint',
                args: [mintParams],
                account: address as `0x${string}`,
            });
            setMintResult({ request });
        } catch (e) {
            console.error("Mint simulation failed:", e);
            setMintError(e as Error);
            setMintResult(null);
        }
    }, [publicClient, address, contracts, token0, token1, pool.fee, tickLower, tickUpper, amount0BigInt, amount1BigInt, isApproval0Needed, isApproval1Needed]);

    useEffect(() => {
        simulateMint();
    }, [simulateMint]);

    const handleApprove0 = () => approve0Result?.request && executeTransaction(approve0Result.request);
    const handleApprove1 = () => approve1Result?.request && executeTransaction(approve1Result.request);
    const handleMint = () => mintResult?.request && executeTransaction(mintResult.request);

    const getButtonText = () => {
        if (!isConnected) return 'Connect Wallet';
        if (isTxPending) return 'Check Wallet...';
        if (isTxConfirming) return 'Transaction Confirming...';
        if (isApproval0Needed) return `Approve ${token0.symbol}`;
        if (isApproval1Needed) return `Approve ${token1.symbol}`;
        return 'Add Liquidity';
    };

    const isButtonDisabled = (
        !isConnected ||
        isTxPending ||
        isTxConfirming ||
        (isApproval0Needed && !approve0Result?.request) ||
        (!isApproval0Needed && isApproval1Needed && !approve1Result?.request) ||
        (!isApproval0Needed && !isApproval1Needed && !mintResult?.request) ||
        !amount0 || !amount1 || !priceLower || !priceUpper
    );

    const handleButtonClick = () => {
        if (!isConnected) return; // Should not happen if button is disabled, but good practice
        if (isApproval0Needed) return handleApprove0();
        if (isApproval1Needed) return handleApprove1();
        return handleMint();
    };

    if (!isConnected) {
        return (
            <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary text-center">
                 <div className="flex items-center mb-6">
                    <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold">Add Liquidity</h2>
                </div>
                <p className="text-brand-text-secondary py-12">Please connect your wallet to add liquidity.</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md bg-brand-surface rounded-2xl p-4 sm:p-6 shadow-2xl border border-brand-secondary">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="mr-3 text-brand-text-secondary hover:text-brand-text-primary">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Add Liquidity for {token0.symbol}/{token1.symbol}</h2>
            </div>

            <LabeledInput label={`Amount of ${token0.symbol}`} value={amount0} onChange={setAmount0} placeholder="0.0" type="number" />
            <LabeledInput label={`Amount of ${token1.symbol}`} value={amount1} onChange={setAmount1} placeholder="0.0" type="number" />

            <div className="my-4">
                <p className="text-sm text-center text-brand-text-secondary">Current price: {currentPrice ? currentPrice.toPrecision(5) : 'Loading...'} {token1.symbol} per {token0.symbol}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <LabeledInput label="Min Price" value={priceLower} onChange={setPriceLower} placeholder="0.0" type="number" />
                <LabeledInput label="Max Price" value={priceUpper} onChange={setPriceUpper} placeholder="0.0" type="number" />
            </div>

            <button
                onClick={handleButtonClick}
                disabled={isButtonDisabled}
                className="w-full bg-brand-primary text-white text-lg font-bold py-3 rounded-xl hover:bg-brand-primary-hover disabled:bg-brand-secondary disabled:cursor-not-allowed transition-all mt-6"
            >
                {getButtonText()}
            </button>
            {mintError && (
                <p className="text-sm text-brand-accent mt-2 text-center">
                    {mintError instanceof BaseError ? mintError.shortMessage : mintError.message}
                </p>
            )}
        </div>
    );
};

export default AddLiquidityCard;