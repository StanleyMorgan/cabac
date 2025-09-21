import { Token, Pool } from './types';
import { sepolia, baseSepolia } from 'viem/chains';

// A commonly used placeholder for native currency
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

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

export const TOKENS_BY_CHAIN: { [chainId: number]: Token[] } = {
    [sepolia.id]: [
        WETH_SEPOLIA,
        USDC_SEPOLIA,
    ],
    [baseSepolia.id]: [
        WETH_BASE_SEPOLIA,
        USDC_BASE_SEPOLIA,
    ]
};

const POOL_WETH_USDC_SEPOLIA: Pool = {
    address: '0x7a43793A32aF1550a43054135285786b4374352a', // Placeholder
    token0: WETH_SEPOLIA,
    token1: USDC_SEPOLIA,
};

const POOL_WETH_USDC_BASE_SEPOLIA: Pool = {
    address: '0x33593f2f458d655f6533d61b58b47e8e7b7f293e', // Placeholder
    token0: WETH_BASE_SEPOLIA,
    token1: USDC_BASE_SEPOLIA,
};

export const POOLS_BY_CHAIN: { [chainId: number]: Pool[] } = {
    [sepolia.id]: [
        POOL_WETH_USDC_SEPOLIA
    ],
    [baseSepolia.id]: [
        POOL_WETH_USDC_BASE_SEPOLIA
    ]
};
