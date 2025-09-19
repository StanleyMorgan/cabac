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
      address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
      decimals: 6,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdc.svg',
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7a98',
      decimals: 6,
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
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdt.svg',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913', // Placeholder: Base Mainnet USDC address
      decimals: 6,
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
      address: '0x3414241656209c1555a8813a07b78918e785f7f9',
      decimals: 6,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD (Wormhole)',
      logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdt.svg',
      address: '0x4279612053915181776251410041936c31940900',
      decimals: 6,
    },
  ],
};