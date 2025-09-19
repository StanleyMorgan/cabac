import type { Token } from './types';
import { sepolia, baseSepolia, celoSepolia } from 'viem/chains';

// Using a conventional address for native tokens
export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  [sepolia.id]: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/eth.svg',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdt.svg',
      address: '0xbC16b56f944ebF92DE3fDAc1a7E025a6107b8F5E',
      decimals: 18,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdc.svg',
      address: '0xc3308336731a6b257957567F43cF233679511a7D',
      decimals: 18,
    },
  ],
  [baseSepolia.id]: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/eth.svg',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
     {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdc.svg',
      address: '0x3BF92B07DB657f5853d054d38fA24Bd654827437',
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdt.svg',
      address: '0x2c0199ff278FE8c9e784828B7CE19158A68Ce7B9', // Placeholder: Base Mainnet USDC address
      decimals: 18,
    },
  ],
  [celoSepolia.id]: [
    {
      symbol: 'CELO',
      name: 'Celo',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/celo.svg',
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
    },
     {
      symbol: 'USDC',
      name: 'USD Coin (Axelar)',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdc.svg',
      address: '0x38b5224979104e351976A446B295773919621C11',
      decimals: 18,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD (Wormhole)',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdt.svg',
      address: '0x486AB02e4f32611b3a8BA1febE9ce5A25Ed1b6b1',
      decimals: 18,
    },
  ],
};