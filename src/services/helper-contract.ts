import { parseUnits } from "viem";
import { ERC20_ABI, TOKEN_MANAGER_HELPER_ABI } from "../constants/abis";
import { publicClient } from "../utils/web3";

// Contract addresses
export const TOKEN_MANAGER_HELPER_ADDRESS = '0xF251F83e40a78868FcfA3FA4599Dad6494E46034';

// Token info interface
export interface TokenInfo {
  version: number;
  tokenManager: `0x${string}`;
  quote: `0x${string}`;
  lastPrice: bigint;
  tradingFeeRate: bigint;
  minTradingFee: bigint;
  launchTime: bigint;
  offers: bigint;
  maxOffers: bigint;
  funds: bigint;
  maxFunds: bigint;
  liquidityAdded: boolean;
}

export interface BuyParams {
  tokenManager: `0x${string}`;
  quote: `0x${string}`;
  estimatedAmount: bigint;
  estimatedCost: bigint;
  estimatedFee: bigint;
  amountMsgValue: bigint;
  amountApproval: bigint;
  amountFunds: bigint;
}

// Get token info
export const getTokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
  const data = await publicClient.readContract({
    address: TOKEN_MANAGER_HELPER_ADDRESS,
    abi: TOKEN_MANAGER_HELPER_ABI,
    functionName: 'getTokenInfo',
    args: [tokenAddress as `0x${string}`]
  });
  
  return {
    version: Number(data[0]),
    tokenManager: data[1],
    quote: data[2],
    lastPrice: data[3],
    tradingFeeRate: data[4],
    minTradingFee: data[5],
    launchTime: data[6],
    offers: data[7],
    maxOffers: data[8],
    funds: data[9],
    maxFunds: data[10],
    liquidityAdded: data[11]
  };
};

export const getBuyParams = async (tokenAddress: string, bnbAmount: string): Promise<BuyParams> => {
  const bnbAmountWei = parseUnits(bnbAmount, 18);
  
  const data = await publicClient.readContract({
    address: TOKEN_MANAGER_HELPER_ADDRESS,
    abi: TOKEN_MANAGER_HELPER_ABI,
    functionName: 'tryBuy',
    args: [tokenAddress as `0x${string}`, 0n, bnbAmountWei]
  });

  return {
    tokenManager: data[0],
    quote: data[1],
    estimatedAmount: data[2],
    estimatedCost: data[3],
    estimatedFee: data[4],
    amountMsgValue: data[5],
    amountApproval: data[6],
    amountFunds: data[7]
  };
};

export const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
  const decimals = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals'
  });
  
  return Number(decimals);
};

export const getTokenBalance = async (tokenAddress: string, walletAddress: string): Promise<bigint> => {
  return await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`]
  });
};

export const getWalletNonce = async (address: string): Promise<number> => {
  return await publicClient.getTransactionCount({
    address: address as `0x${string}`,
  });
};

export const getCurrentBlockNumber = async (): Promise<bigint> => {
  return await publicClient.getBlockNumber();
};

export const getTokenAllowance = async (
  tokenAddress: string, 
  ownerAddress: string, 
  spenderAddress: string
): Promise<bigint> => {
  return await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
  });
};


export const getTokenBalancesForWallets = async (
  tokenAddress: string,
  walletAddresses: string[]
): Promise<{ address: string, balance: bigint }[]> => {
  const results = [];
  
  for (const address of walletAddresses) {
    const balance = await getTokenBalance(tokenAddress, address);
    results.push({
      address,
      balance
    });
  }
  
  return results;
};

export const getTokenSymbol = async (tokenAddress: string): Promise<string> => {
  try {
    return await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'symbol',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'string' }]
        }
      ],
      functionName: 'symbol'
    });
  } catch (error) {
    console.error('Error getting token symbol:', error);
    return 'UNKNOWN';
  }
};

export const getTokenName = async (tokenAddress: string): Promise<string> => {
  try {
    return await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'name',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'string' }]
        }
      ],
      functionName: 'name'
    });
  } catch (error) {
    console.error('Error getting token name:', error);
    return 'Unknown Token';
  }
};