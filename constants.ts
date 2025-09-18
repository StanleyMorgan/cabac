import type { Token } from './types';

export const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/eth.svg',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/weth.svg',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/usdc.svg',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  {
    symbol: 'DAI',
    name: 'Dai',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/dai.svg',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/wbtc.svg',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
  },
  {
    symbol: 'UNI',
    name: 'UNI Token',
    logoURI: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c2566b/svg/color/uni.svg',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
  },
];