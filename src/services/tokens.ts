import { formatUnits } from 'viem';
import { loadWallets } from './wallet';
import { 
  getTokenBalancesForWallets, 
  getTokenDecimals, 
  getTokenName, 
  getTokenSymbol 
} from './helper-contract';

export interface TokenBalanceData {
  address: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  balanceRaw: bigint;
  decimals: number;
}

export const getUserTokenBalances = async (
  userId: string,
  tokenAddress: string
): Promise<TokenBalanceData[]> => {
  const wallets = loadWallets(userId);
  
  if (wallets.length === 0) {
    return [];
  }
  
  const walletAddresses = wallets.map(wallet => wallet.address);
  
  // Get token info
  const [decimals, tokenName, tokenSymbol] = await Promise.all([
    getTokenDecimals(tokenAddress),
    getTokenName(tokenAddress),
    getTokenSymbol(tokenAddress)
  ]);
  
  // Get balances for all wallets
  const balances = await getTokenBalancesForWallets(tokenAddress, walletAddresses);
  
  return balances.map(item => ({
    address: item.address,
    tokenAddress,
    tokenName,
    tokenSymbol,
    balance: formatUnits(item.balance, decimals),
    balanceRaw: item.balance,
    decimals
  }));
};

export const getTotalTokenBalance = async (
  userId: string,
  tokenAddress: string
): Promise<{ 
  totalBalance: string; 
  totalBalanceRaw: bigint; 
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
}> => {
  const balances = await getUserTokenBalances(userId, tokenAddress);
  
  if (balances.length === 0) {
    const [decimals, tokenName, tokenSymbol] = await Promise.all([
      getTokenDecimals(tokenAddress),
      getTokenName(tokenAddress),
      getTokenSymbol(tokenAddress)
    ]);
    
    return {
      totalBalance: '0',
      totalBalanceRaw: 0n,
      tokenSymbol,
      tokenName,
      decimals
    };
  }
  
  const totalBalanceRaw = balances.reduce(
    (sum, item) => sum + item.balanceRaw, 
    0n
  );
  
  return {
    totalBalance: formatUnits(totalBalanceRaw, balances[0].decimals),
    totalBalanceRaw,
    tokenSymbol: balances[0].tokenSymbol,
    tokenName: balances[0].tokenName,
    decimals: balances[0].decimals
  };
}; 