export interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
}

export interface Pool {
  address: string;
  token0: Token;
  token1: Token;
  tvl?: number; // Total Value Locked in USD
  myLiquidity?: number; // User's liquidity value in USD
}
