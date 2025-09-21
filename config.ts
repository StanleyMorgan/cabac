import { sepolia, baseSepolia } from 'viem/chains';

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "tokenIn", "type": "address" },
          { "internalType": "address", "name": "tokenOut", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
          { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct ISwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const POOL_ABI = [
    {
        "inputs": [],
        "name": "slot0",
        "outputs": [
            { "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" },
            { "internalType": "int24", "name": "tick", "type": "int24" },
            { "internalType": "uint16", "name": "observationIndex", "type": "uint16" },
            { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" },
            { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" },
            { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" },
            { "internalType": "bool", "name": "unlocked", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tickSpacing",
        "outputs": [
            { "internalType": "int24", "name": "", "type": "int24" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const POSITION_MANAGER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "token0", "type": "address" },
          { "internalType": "address", "name": "token1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickLower", "type": "int24" },
          { "internalType": "int24", "name": "tickUpper", "type": "int24" },
          { "internalType": "uint256", "name": "amount0Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount0Min", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Min", "type": "uint256" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct INonfungiblePositionManager.MintParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
      { "internalType": "uint256", "name": "amount0", "type": "uint256" },
      { "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// Uniswap V3 contract addresses on various networks
const UNISWAP_V3_ROUTER_SEPOLIA = '0x3bFA4769FB09eefC5aB096D48E9C6aC962d62338';
const UNISWAP_V3_POSITION_MANAGER_SEPOLIA = '0x1238536071E1c577A6022ACf2c08B58Ee7F2E898';

const UNISWAP_V3_ROUTER_BASE_SEPOLIA = '0x03a48B41c244848806A338075304B359e19bC8E4';
const UNISWAP_V3_POSITION_MANAGER_BASE_SEPOLIA = '0x3c79D4a4b5D55DE5525204454839845340E2515a';


// WETH addresses
const WETH_SEPOLIA = '0x7b79995e5f793A07Bc00c21412e50Eaae098E7f9';
const WETH_BASE_SEPOLIA = '0x4200000000000000000000000000000000000006';

export const CONTRACT_ADDRESSES: { [chainId: number]: { ROUTER: `0x${string}`, POSITION_MANAGER: `0x${string}`, WETH: `0x${string}` } } = {
    [sepolia.id]: {
        ROUTER: UNISWAP_V3_ROUTER_SEPOLIA,
        POSITION_MANAGER: UNISWAP_V3_POSITION_MANAGER_SEPOLIA,
        WETH: WETH_SEPOLIA,
    },
    [baseSepolia.id]: {
        ROUTER: UNISWAP_V3_ROUTER_BASE_SEPOLIA,
        POSITION_MANAGER: UNISWAP_V3_POSITION_MANAGER_BASE_SEPOLIA,
        WETH: WETH_BASE_SEPOLIA,
    }
};
