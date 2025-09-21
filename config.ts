import { baseSepolia } from 'viem/chains';

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
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
    "outputs": [{ "name": "", "type": "bool" }],
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
        "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }],
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

export const CONTRACT_ADDRESSES: Record<number, { ROUTER?: `0x${string}`, WETH?: `0x${string}`, POSITION_MANAGER?: `0x${string}` }> = {
  [baseSepolia.id]: {
    ROUTER: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    WETH: '0x4200000000000000000000000000000000000022',
    POSITION_MANAGER: '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A',
  },
};
