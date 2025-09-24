import { sepolia, baseSepolia } from 'viem/chains';

export const ERC20_ABI = [
    {
        "type": "function",
        "name": "allowance",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" },
            { "name": "spender", "type": "address", "internalType": "address" }
        ],
        "outputs": [ { "name": "", "type": "uint256", "internalType": "uint256" } ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "approve",
        "inputs": [
            { "name": "spender", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [ { "name": "", "type": "bool", "internalType": "bool" } ],
        "stateMutability": "nonpayable"
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
        "outputs": [
            { "type": "uint256", "name": "amountOut" }
        ],
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

export const CONTRACT_ADDRESSES: {
    [chainId: number]: {
        ROUTER: `0x${string}`;
        WETH: `0x${string}`;
        POSITION_MANAGER: `0x${string}`;
    };
} = {
    [sepolia.id]: {
        ROUTER: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
        WETH: '0x7b79995e5f793A07Bc00c21412e50Eaae098E7f9',
        POSITION_MANAGER: '0x1238536071E1c577A6022ACf2A142739B9F0422f',
    },
    [baseSepolia.id]: {
        ROUTER: '0x940908f2216524D414d231221c33dE4417d4D362',
        WETH: '0x4200000000000000000000000000000000000006',
        POSITION_MANAGER: '0x323A5734289389531818a335E30064C42125191C',
    }
};