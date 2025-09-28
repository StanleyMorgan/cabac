import { base, sepolia, baseSepolia, celoSepolia } from 'viem/chains';

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

export const WETH_ABI = [
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "wad", "type": "uint256" }],
        "name": "withdraw",
        "outputs": [],
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

export const QUOTER_V2_ABI = [
    {
      "inputs": [
        { "internalType": "address", "name": "_factory", "type": "address" },
        { "internalType": "address", "name": "_WETH9", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "WETH9",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "bytes", "name": "path", "type": "bytes" },
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
      ],
      "name": "quoteExactInput",
      "outputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "uint160[]", "name": "sqrtPriceX96AfterList", "type": "uint160[]" },
        { "internalType": "uint32[]", "name": "initializedTicksCrossedList", "type": "uint32[]" },
        { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            { "internalType": "address", "name": "tokenIn", "type": "address" },
            { "internalType": "address", "name": "tokenOut", "type": "address" },
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint24", "name": "fee", "type": "uint24" },
            { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
          ],
          "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "quoteExactInputSingle",
      "outputs": [
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
        { "internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160" },
        { "internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32" },
        { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "bytes", "name": "path", "type": "bytes" },
        { "internalType": "uint256", "name": "amountOut", "type": "uint256" }
      ],
      "name": "quoteExactOutput",
      "outputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint160[]", "name": "sqrtPriceX96AfterList", "type": "uint160[]" },
        { "internalType": "uint32[]", "name": "initializedTicksCrossedList", "type": "uint32[]" },
        { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            { "internalType": "address", "name": "tokenIn", "type": "address" },
            { "internalType": "address", "name": "tokenOut", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint24", "name": "fee", "type": "uint24" },
            { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
          ],
          "internalType": "struct IQuoterV2.QuoteExactOutputSingleParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "quoteExactOutputSingle",
      "outputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160" },
        { "internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32" },
        { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "int256", "name": "amount0Delta", "type": "int256" },
        { "internalType": "int256", "name": "amount1Delta", "type": "int256" },
        { "internalType": "bytes", "name": "path", "type": "bytes" }
      ],
      "name": "uniswapV3SwapCallback",
      "outputs": [],
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
        QUOTER_V2: `0x${string}`;
    }
} = {
    [base.id]: {
        ROUTER: '0xe2649752dE1DEb3A7bC7Ad3e1CDcE9eb8535392d',
        POSITION_MANAGER: '0x4415E20643a50cCa212a2243759F536A547E3AAE',
        WETH: '0x4200000000000000000000000000000000000006',
        QUOTER_V2: '0x827eEca8591ae7e641784A5Fb1e4597c029Ab41B', // User-provided address
    },
    [sepolia.id]: {
        ROUTER: '0x3bFA4769FB09eefC5aB096D40Ea009372DE6A227',
        POSITION_MANAGER: '0x1238536071E1c577A68CF586AbD578b2B4182373',
        WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        QUOTER_V2: '0x3d4e44Eb1374240CE5F1B871ab261CD16335154A', // Uniswap V3 QuoterV2 on Sepolia
    },
    [baseSepolia.id]: {
        ROUTER: '0x236216C666dbcc76D057539475660dC48f9e0808',
        POSITION_MANAGER: '0x195339564373c25265f954d89Bfa9Ae20136D0Fe',
        WETH: '0x4200000000000000000000000000000000000006',
        QUOTER_V2: '0xAb0dcf765DBd686443950ccAf5bd5FA414a728d1', // User-provided address
    },
    [celoSepolia.id]: {
        ROUTER: '0x7671Ac570a0c3d2370E477d8498fFAc2662b3d25',
        POSITION_MANAGER: '0xC4eC102f0420393077aFF8048E467c3DC7246FB1',
        WETH: '0x471EcE3750Da237f93B8E339c536989b8978a438',
        QUOTER_V2: '0xf792Ff903115bAF02A9E77372ecd8264E97Db3d7', // User-provided address
    }
};