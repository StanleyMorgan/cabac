import type { Token } from './types';
import { sepolia, baseSepolia, celoSepolia } from 'viem/chains';

// Using a conventional address for native tokens
export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  [sepolia.id]: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      address: '0xbC16b56f944ebF92DE3fDAc1a7E025a6107b8F5E',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      address: '0xc3308336731a6b257957567F43cF233679511a7D',
      decimals: 18,
    },
  ],
  [baseSepolia.id]: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
     {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      address: '0x3BF92B07DB657f5853d054d38fA24Bd654827437',
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      address: '0x2c0199ff278FE8c9e784828B7CE19158A68Ce7B9', // Placeholder: Base Mainnet USDC address
      decimals: 18,
    },
  ],
  [celoSepolia.id]: [
    {
      symbol: 'CELO',
      name: 'Celo',
      logoURI: 'https://assets.coingecko.com/coins/images/11090/large/icon-celo-CELO-color-500.png',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
     {
      symbol: 'USDC',
      name: 'USD Coin (Axelar)',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      address: '0x38b5224979104e351976A446B295773919621C11',
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD (Wormhole)',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      address: '0x486AB02e4f32611b3a8BA1febE9ce5A25Ed1b6b1',
      decimals: 18,
    },
  ],
};