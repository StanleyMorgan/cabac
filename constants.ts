import { Token, Pool } from './types';
import { sepolia, baseSepolia } from 'viem/chains';

// A commonly used placeholder for native currency
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// --- Native Tokens ---
const ETH_SEPOLIA: Token = {
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'ETH',
    name: 'Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

const ETH_BASE_SEPOLIA: Token = {
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'ETH',
    name: 'Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

// --- Sepolia Tokens ---
const WETH_SEPOLIA: Token = {
    address: '0x7b79995e5f793A07Bc00c21412e50Eaae098E7f9',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

const USDC_SEPOLIA: Token = {
    address: '0x94a9D9AC8a22534E3FaCa4E4343A411334533C6E',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    decimals: 6,
};


// --- Base Sepolia Tokens ---
const WETH_BASE_SEPOLIA: Token = {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

const USDC_BASE_SEPOLIA: Token = {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    decimals: 6,
};

const USDT_BASE_SEPOLIA: Token = {
    address: '0x718f3b207a75a2a537151a70438153a81a7d1a2d',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    decimals: 6,
};


export const TOKENS_BY_CHAIN: { [chainId: number]: Token[] } = {
    [sepolia.id]: [
        ETH_SEPOLIA,
        WETH_SEPOLIA,
        USDC_SEPOLIA,
    ],
    [baseSepolia.id]: [
        ETH_BASE_SEPOLIA,
        WETH_BASE_SEPOLIA,
        USDC_BASE_SEPOLIA,
        USDT_BASE_SEPOLIA,
    ]
};

// --- Pools ---
const POOL_WETH_USDC_SEPOLIA: Pool = {
    address: '0x7a43793A32aF1550a43054135285786b4374352a', // Placeholder
    token0: WETH_SEPOLIA,
    token1: USDC_SEPOLIA,
};

const POOL_USDC_USDT_BASE_SEPOLIA: Pool = {
    address: '0xDA84d2f810f682fb392CA1126CAe7462542B0903',
    // token0 must be the token with the smaller address
    token0: USDC_BASE_SEPOLIA, // 0x036...
    token1: USDT_BASE_SEPOLIA, // 0x718...
};


export const POOLS_BY_CHAIN: { [chainId: number]: Pool[] } = {
    [sepolia.id]: [
        POOL_WETH_USDC_SEPOLIA
    ],
    [baseSepolia.id]: [
        POOL_USDC_USDT_BASE_SEPOLIA
    ]
};