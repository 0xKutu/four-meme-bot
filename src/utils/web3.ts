import dotenv from 'dotenv';
import { JsonRpcProvider } from 'ethers';
import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";

dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org';
// export const BSC_RPC_URL = 'https://binance.llamarpc.com';

export const getProvider = () => {
  // return new JsonRpcProvider(ALCHEMY_API_KEY ? `https://bsc-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : 'https://bsc-dataseed.binance.org');
  // return new JsonRpcProvider('https://binance.llamarpc.com');
  return new JsonRpcProvider(BSC_RPC_URL);
}

export const publicClient = createPublicClient({
  chain: bsc,
  transport: http(BSC_RPC_URL)
});
