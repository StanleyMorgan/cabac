
export interface Token {
  symbol: string;
  name: string;
  logoURI: string;
  address: string;
  decimals: number;
}

export interface Pool {
  address: `0x${string}`;
  token0: Token;
  token1: Token;
}
