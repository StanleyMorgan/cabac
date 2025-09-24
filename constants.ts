import type { Token, Pool } from './types';
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
    address: '0x4b1a87123583b2E630152668a2c2fABb44b32F36',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    decimals: 18,
};

const USDT_BASE_SEPOLIA: Token = {
    address: '0xAFf0958d14195ccC4Cb9c7Dd221eE89fd9a54470',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    decimals: 18,
};

const USDE_BASE_SEPOLIA: Token = {
    address: '0x7ECcf3461A0d9abDB4FdB26351d7022162Faba08',
    symbol: 'USDe',
    name: 'Ethena USDe',
    logoURI: 'https://assets.coingecko.com/coins/images/33613/small/usde.png',
    decimals: 18,
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
        USDE_BASE_SEPOLIA,
    ]
};

// --- Pools ---
const POOL_WETH_USDC_SEPOLIA: Pool = {
    address: '0x7a43793A32aF1550a43054135285786b4374352a', // Placeholder
    token0: WETH_SEPOLIA,
    token1: USDC_SEPOLIA,
    fee: 3000,
    myLiquidity: 0,
};

const POOL_USDC_USDT_BASE_SEPOLIA: Pool = {
    address: '0x9c48fB7a9481c9E57E900B35E41dc312A6323C92',
    // token0 must be the token with the smaller address
    token0: USDC_BASE_SEPOLIA, // 0x4b1...
    token1: USDT_BASE_SEPOLIA, // 0xAFf...
    fee: 3000, // 0.3% fee tier
    myLiquidity: 0,
};

const POOL_USDE_USDT_BASE_SEPOLIA: Pool = {
    address: '0xafa0e7d7f8b606eee7492395477e3176deb29f8a',
    // token0 must be the token with the smaller address
    token0: USDE_BASE_SEPOLIA, // 0x7EC...
    token1: USDT_BASE_SEPOLIA, // 0xAFf...
    fee: 3000, // 0.3% fee tier
    myLiquidity: 0,
};


export const POOLS_BY_CHAIN: { [chainId: number]: Pool[] } = {
    [sepolia.id]: [
        POOL_WETH_USDC_SEPOLIA
    ],
    [baseSepolia.id]: [
        POOL_USDC_USDT_BASE_SEPOLIA,
        POOL_USDE_USDT_BASE_SEPOLIA,
    ]
};