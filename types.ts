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
}
