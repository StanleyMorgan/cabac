import type { Token, Pool } from './types';
import { base, sepolia, baseSepolia, celoSepolia } from 'viem/chains';

// A commonly used placeholder for native currency
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// --- Native Tokens ---
const ETH_BASE: Token = {
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'ETH',
    name: 'Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

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

// --- Base Mainnet Tokens ---
const WETH_BASE: Token = {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    decimals: 18,
};

const USDC_BASE: Token = {
    address: '0xbCe7BA2d640e56D46E0D57887E5Cd7111ABacC75',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    decimals: 18,
};

const USDT_BASE: Token = {
    address: '0x3e7412a9b0742F6f98808F35Ceed1115a35d5092',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    decimals: 18,
};

const USDE_BASE: Token = {
    address: '0x81beeF0E0b601cDEc4DE52F642CCCf46c331cDB1',
    symbol: 'USDe',
    name: 'Ethena USDe',
    logoURI: 'https://assets.coingecko.com/coins/images/33613/small/usde.png',
    decimals: 18,
};


// --- Sepolia Tokens ---
const WETH_SEPOLIA: Token = {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
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
    // NOTE: The user has confirmed that their specific testnet version of this token uses 18 decimals.
    // Standard testnet USDC usually has 6. This is a deliberate configuration.
    decimals: 18,
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
    // NOTE: The user has confirmed that their specific testnet version of this token uses 18 decimals.
    // Standard testnet USDC usually has 6. This is a deliberate configuration.
    decimals: 18,
};

const USDT_BASE_SEPOLIA: Token = {
    address: '0xAFf0958d14195ccC4Cb9c7Dd221eE89fd9a54470',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    // NOTE: The user has confirmed that their specific testnet version of this token uses 18 decimals.
    // Standard testnet USDT usually has 6. This is a deliberate configuration.
    decimals: 18,
};

const USDE_BASE_SEPOLIA: Token = {
    address: '0x7ECcf3461A0d9abDB4FdB26351d7022162Faba08',
    symbol: 'USDe',
    name: 'Ethena USDe',
    logoURI: 'https://assets.coingecko.com/coins/images/33613/small/usde.png',
    decimals: 18,
};

// --- Celo Sepolia Tokens ---
// In Celo, the native asset is often used in its ERC-20 form (like WETH) but referred to as just CELO.
const CELO_ON_CELO_SEPOLIA: Token = {
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    symbol: 'CELO', // Not WCELO for better UX
    name: 'Celo', // Not "Wrapped Celo"
    logoURI: 'https://i.imgur.com/h43XIEb.png',
    decimals: 18,
};

const USDT_CELO_SEPOLIA: Token = {
    address: '0xF103317F558778260C428037881aDcdfE999BD4E',
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    // NOTE: The user has confirmed that their specific testnet version of this token uses 18 decimals.
    // Standard testnet USDT usually has 6. This is a deliberate configuration.
    decimals: 18,
};

const USDC_CELO_SEPOLIA: Token = {
    address: '0x0Af7c4A52b5C2cc18E8C3b707d40dF561d5D8D6B',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    // NOTE: The user has confirmed that their specific testnet version of this token uses 18 decimals.
    // Standard testnet USDC usually has 6. This is a deliberate configuration.
    decimals: 18,
};

const USDE_CELO_SEPOLIA: Token = {
    address: '0x2c0199ff278FE8c9e784828B7CE19158A68Ce7B9',
    symbol: 'USDe',
    name: 'Ethena USDe',
    logoURI: 'https://assets.coingecko.com/coins/images/33613/small/usde.png',
    decimals: 18,
};


export const TOKENS_BY_CHAIN: { [chainId: number]: Token[] } = {
    [base.id]: [
        ETH_BASE,
        WETH_BASE,
        USDC_BASE,
        USDT_BASE,
        USDE_BASE,
    ],
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
    ],
    [celoSepolia.id]: [
        CELO_ON_CELO_SEPOLIA, // The ERC-20 version is the one used for swaps.
        USDC_CELO_SEPOLIA,
        USDT_CELO_SEPOLIA,
        USDE_CELO_SEPOLIA,
    ]
};

// --- Pools ---
// --- Base Mainnet Pools ---
const POOL_USDT_USDC_BASE: Pool = {
    address: '0xf5a6e90ee54980d82353178673aD48a142eC9f86',
    // token0 must be the token with the smaller address
    token0: USDT_BASE, // 0x3e...
    token1: USDC_BASE, // 0xbCe...
    fee: 3000, // 0.3% fee tier
    myLiquidity: 0,
};

const POOL_USDT_USDE_BASE: Pool = {
    address: '0x9d39C1F7251D0E874671E54dCA7D8c55f65a55Ce',
    // token0 must be the token with the smaller address
    token0: USDT_BASE, // 0x3e...
    token1: USDE_BASE, // 0x81b...
    fee: 3000, // 0.3% fee tier
    myLiquidity: 0,
};


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

const POOL_USDC_USDT_CELO_SEPOLIA: Pool = {
    address: '0x1B9A6e6b26A83F9938Bb5e22bF494648C14950c8',
    // token0 must be the token with the smaller address
    token0: USDC_CELO_SEPOLIA, // 0x0Af...
    token1: USDT_CELO_SEPOLIA, // 0xF10...
    fee: 3000,
    myLiquidity: 0,
};

const POOL_USDE_USDT_CELO_SEPOLIA: Pool = {
    address: '0x37428a1dbC5980776407c264a80a818e44b2B166',
    // token0 must be the token with the smaller address
    token0: USDE_CELO_SEPOLIA, // 0x2c0...
    token1: USDT_CELO_SEPOLIA, // 0xF10...
    fee: 3000,
    myLiquidity: 0,
};


export const POOLS_BY_CHAIN: { [chainId: number]: Pool[] } = {
    [base.id]: [
        POOL_USDT_USDC_BASE,
        POOL_USDT_USDE_BASE,
    ],
    [sepolia.id]: [
        POOL_WETH_USDC_SEPOLIA
    ],
    [baseSepolia.id]: [
        POOL_USDC_USDT_BASE_SEPOLIA,
        POOL_USDE_USDT_BASE_SEPOLIA,
    ],
    [celoSepolia.id]: [
        POOL_USDC_USDT_CELO_SEPOLIA,
        POOL_USDE_USDT_CELO_SEPOLIA,
    ]
};