import { ethers, formatEther, parseUnits } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { BSC_RPC_URL, getProvider, publicClient } from '../utils/web3';
import { createWalletClient, http, parseEther, Address } from 'viem';
import { bsc } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { sendBundleTxs } from './bloxroute';

const WALLETS_DIR = path.join(__dirname, '../data/wallets');

// Ensure wallets directory exists
if (!fs.existsSync(WALLETS_DIR)) {
  fs.mkdirSync(WALLETS_DIR, { recursive: true });
}

// Initialize provider
const provider = getProvider();

// Interface for wallet data
interface WalletData {
  address: string;
  privateKey: string;
}

// Save wallets to file for a specific user
const saveWallets = (userId: string, wallets: WalletData[]): void => {
  const userWalletFile = path.join(WALLETS_DIR, `${userId}.json`);
  fs.writeFileSync(userWalletFile, JSON.stringify(wallets, null, 2));
};

// Load wallets from file for a specific user
export const loadWallets = (userId: string): WalletData[] => {
  const userWalletFile = path.join(WALLETS_DIR, `${userId}.json`);
  if (!fs.existsSync(userWalletFile)) {
    return [];
  }
  
  const data = fs.readFileSync(userWalletFile, 'utf8');
  return JSON.parse(data);
};

// Get all user IDs
const getAllUserIds = (): string[] => {
  if (!fs.existsSync(WALLETS_DIR)) {
    return [];
  }
  
  return fs.readdirSync(WALLETS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
};

// Create multiple wallets
export const createWallets = async (count: number, userId: string): Promise<WalletData[]> => {
  const existingWallets = loadWallets(userId);
  const newWallets: WalletData[] = [];
  
  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.createRandom();
    newWallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
    });
  }
  
  const allWallets = [...existingWallets, ...newWallets];
  saveWallets(userId, allWallets);
  
  return newWallets;
};

// Get wallet addresses for a specific user
export const getWalletsAddresses = (userId?: string): string[] => {
  if (userId) {
    return loadWallets(userId).map(wallet => wallet.address);
  }
  
  // If no userId provided, return all addresses from all users
  const allAddresses: string[] = [];
  getAllUserIds().forEach(id => {
    const userWallets = loadWallets(id);
    allAddresses.push(...userWallets.map(wallet => wallet.address));
  });
  
  return allAddresses;
};

// Get all wallets with balances for a specific user
export const getWallets = async (userId?: string): Promise<{ address: string; privateKey: string; balance: string }[]> => {
  let walletsToCheck: WalletData[] = [];

  if (userId) {
    walletsToCheck = loadWallets(userId);
  } else {
    // If no userId provided, get all wallets from all users
    getAllUserIds().forEach(id => {
      const userWallets = loadWallets(id);
      walletsToCheck.push(...userWallets);
    });
  }

  const walletsWithBalance = await Promise.all(
    walletsToCheck.map(async (wallet) => {
      const balance = await provider.getBalance(wallet.address);
      console.log("balance:", balance);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: formatEther(balance),
      };
    })
  );
  
  return walletsWithBalance;
};

export const getWalletClient = (privateKey: Address) => {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(BSC_RPC_URL)
  })
}

export const distributeTokens = async (amountPerWallet: number, userId: string): Promise<{ count: number }> => {
  let walletsToFund: WalletData[] = [];
  // let mainWallet: ethers.Wallet;

  if (userId) {
    const wallets = loadWallets(userId);
    if (wallets.length === 0) {
      throw new Error('No wallets found. Create wallets first.');
    }
    walletsToFund = wallets;
    // mainWallet = new ethers.Wallet(wallets[0].privateKey, provider);
  } else {
    throw new Error('No userId provided.');
  }

  const walletClient = getWalletClient(walletsToFund[0].privateKey as `0x${string}`);

  const mainBalance = await provider.getBalance(walletClient.account.address);

  const amountPerWalletWei = parseEther(amountPerWallet.toString());
  const totalAmount = amountPerWalletWei * BigInt(walletsToFund.length);

  if (mainBalance < totalAmount) {
    throw new Error('Insufficient balance in main wallet.');
  }

  const txs = [];
  let nonce = await publicClient.getTransactionCount({
    address: walletClient.account.address,
  });

  // Send BNB to each wallet
  for (let i = 1; i < walletsToFund.length; i++) {
    const wallet = walletsToFund[i];
    console.log("wallet:", wallet);
    const signature = await walletClient.signTransaction({
      // id: 2,
      account: walletClient.account,
      nonce: nonce,
      to: wallet.address as `0x${string}`,
      value: amountPerWalletWei,
      chain: bsc,
      gasPrice: parseUnits("3", "gwei"),
      gas: 21000n,
      data: '0x'
    })
    console.log("signedTx", signature);
    txs.push(signature.slice(2));
    nonce++;
  }

  const currentBlock = await provider.getBlockNumber();
  // const targetBlockHex = toBeHex(currentBlock + 2);
  const targetBlockHex = `0x${(currentBlock + 2).toString(16)}`;
  console.log("currentBlock", currentBlock);
  console.log("targetBlockHex", targetBlockHex);
  console.log("txs", txs);

  const bundle = await sendBundleTxs(txs);

  return { count: walletsToFund.length };
};

// Get wallet by address
export const getWalletByAddress = (address: string): WalletData | null => {
  for (const userId of getAllUserIds()) {
    const userWallets = loadWallets(userId);
    const wallet = userWallets.find(w => w.address.toLowerCase() === address.toLowerCase());
    if (wallet) {
      return wallet;
    }
  }
  
  return null;
};

// Get all wallets for a specific user
export const getUserWallets = (userId: string): WalletData[] => {
  return loadWallets(userId);
};
