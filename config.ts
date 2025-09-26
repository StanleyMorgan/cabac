import { sepolia, baseSepolia } from 'viem/chains';

// --- ABIs ---

// Fix: Add 'as const' for correct type inference with viem
export const ERC20_ABI = [
  {
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
        {
            "name": "_owner",
            "type": "address"
        }
    ],
    "name": "balanceOf",
    "outputs": [
        {
            "name": "balance",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "type": "address", "name": "tokenIn" },
          { "type": "address", "name": "tokenOut" },
          { "type": "uint24", "name": "fee" },
          { "type": "address", "name": "recipient" },
          { "type": "uint256", "name": "deadline" },
          { "type": "uint256", "name": "amountIn" },
          { "type": "uint256", "name": "amountOutMinimum" },
          { "type": "uint160", "name": "sqrtPriceLimitX96" }
        ],
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{ "type": "uint256", "name": "amountOut" }],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const POOL_ABI = [
    {
        "inputs": [],
        "name": "slot0",
        "outputs": [
            { "type": "uint160", "name": "sqrtPriceX96" },
            { "type": "int24", "name": "tick" },
            { "type": "uint16", "name": "observationIndex" },
            { "type": "uint16", "name": "observationCardinality" },
            { "type": "uint16", "name": "observationCardinalityNext" },
            { "type": "uint8", "name": "feeProtocol" },
            { "type": "bool", "name": "unlocked" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tickSpacing",
        "outputs": [
            { "type": "int24", "name": "" }
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
                    { "type": "address", "name": "token0" },
                    { "type": "address", "name": "token1" },
                    { "type": "uint24", "name": "fee" },
                    { "type": "int24", "name": "tickLower" },
                    { "type": "int24", "name": "tickUpper" },
                    { "type": "uint256", "name": "amount0Desired" },
                    { "type": "uint256", "name": "amount1Desired" },
                    { "type": "uint256", "name": "amount0Min" },
                    { "type": "uint256", "name": "amount1Min" },
                    { "type": "address", "name": "recipient" },
                    { "type": "uint256", "name": "deadline" }
                ],
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "mint",
        "outputs": [
            { "type": "uint256", "name": "tokenId" },
            { "type": "uint128", "name": "liquidity" },
            { "type": "uint256", "name": "amount0" },
            { "type": "uint256", "name": "amount1" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    { "type": "uint256", "name": "tokenId" },
                    { "type": "uint256", "name": "amount0Desired" },
                    { "type": "uint256", "name": "amount1Desired" },
                    { "type": "uint256", "name": "amount0Min" },
                    { "type": "uint256", "name": "amount1Min" },
                    { "type": "uint256", "name": "deadline" }
                ],
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "increaseLiquidity",
        "outputs": [
            { "type": "uint128", "name": "liquidity" },
            { "type": "uint256", "name": "amount0" },
            { "type": "uint256", "name": "amount1" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    { "type": "uint256", "name": "tokenId" },
                    { "type": "uint128", "name": "liquidity" },
                    { "type": "uint256", "name": "amount0Min" },
                    { "type": "uint256", "name": "amount1Min" },
                    { "type": "uint256", "name": "deadline" }
                ],
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "decreaseLiquidity",
        "outputs": [
            { "type": "uint256", "name": "amount0" },
            { "type": "uint256", "name": "amount1" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    { "type": "uint256", "name": "tokenId" },
                    { "type": "address", "name": "recipient" },
                    { "type": "uint128", "name": "amount0Max" },
                    { "type": "uint128", "name": "amount1Max" }
                ],
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "collect",
        "outputs": [
            { "type": "uint256", "name": "amount0" },
            { "type": "uint256", "name": "amount1" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "type": "uint256", "name": "tokenId" }],
        "name": "burn",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "type": "address", "name": "owner" }],
        "name": "balanceOf",
        "outputs": [{ "type": "uint256", "name": "" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "type": "address", "name": "owner" },
            { "type": "uint256", "name": "index" }
        ],
        "name": "tokenOfOwnerByIndex",
        "outputs": [{ "type": "uint256", "name": "" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "type": "uint256", "name": "tokenId" }],
        "name": "positions",
        "outputs": [
            { "type": "uint96", "name": "nonce" },
            { "type": "address", "name": "operator" },
            { "type": "address", "name": "token0" },
            { "type": "address", "name": "token1" },
            { "type": "uint24", "name": "fee" },
            { "type": "int24", "name": "tickLower" },
            { "type": "int24", "name": "tickUpper" },
            { "type": "uint128", "name": "liquidity" },
            { "type": "uint256", "name": "feeGrowthInside0LastX128" },
            { "type": "uint256", "name": "feeGrowthInside1LastX128" },
            { "type": "uint128", "name": "tokensOwed0" },
            { "type": "uint128", "name": "tokensOwed1" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;


// --- Contract Addresses ---

export const CONTRACT_ADDRESSES: {
    [chainId: number]: {
        ROUTER: `0x${string}`;
        POSITION_MANAGER: `0x${string}`;
        WETH: `0x${string}`;
    }
} = {
    [sepolia.id]: {
        ROUTER: '0x3bFA4769FB09eefC5aB096D40Ea009372DE6A227',
        POSITION_MANAGER: '0x1238536071E1c577A68CF586AbD578b2B4182373',
        WETH: '0x7b79995e5f793A07Bc00c21412e50Eaae098E7f9',
    },
    [baseSepolia.id]: {
        ROUTER: '0x236216C666dbcc76D057539475660dC48f9e0808',
        POSITION_MANAGER: '0x195339564373c25265f954d89Bfa9Ae20136D0Fe',
        WETH: '0x4200000000000000000000000000000000000006',
    }
};