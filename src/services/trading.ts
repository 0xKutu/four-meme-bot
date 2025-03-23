import { parseUnits } from 'ethers';
import { getWalletClient, loadWallets } from './wallet';
import { encodeFunctionData, maxUint256 } from 'viem';
import { bsc } from 'viem/chains';
import { getBuyParams, getTokenAllowance, getTokenBalance, getTokenInfo, getWalletNonce } from './helper-contract';
import { ERC20_ABI, TOKEN_MANAGER_V1_ABI, TOKEN_MANAGER_V2_ABI } from '../constants/abis';
import { sendBundleTxs } from './bloxroute';
import { decodeErrorResult } from 'viem';

const BUY_GAS_LIMIT = 400000n;
const SELL_GAS_LIMIT = 500000n;
const APPROVE_GAS_LIMIT = 100000n;

// Buy tokens with all user wallets via bundle
export const buyTokens = async (
  tokenAddress: string, 
  bnbAmountPerWallet: number, 
  userId: string
): Promise<{ txHash: string }> => {
  const wallets = loadWallets(userId);
  if (wallets.length === 0) {
    throw new Error('No wallets found. Create wallets first.');
  }

  const tokenInfo = await getTokenInfo(tokenAddress);
  const tokenManagerAddress = tokenInfo.tokenManager;
  const version = tokenInfo.version;

  const txs = [];
  
  // Prepare transactions for each wallet
  for (const wallet of wallets) {
    const walletClient = getWalletClient(wallet.privateKey as `0x${string}`);

    const nonce = await getWalletNonce(walletClient.account.address);

    const buyParams = await getBuyParams(tokenAddress, bnbAmountPerWallet.toString());

    let to: `0x${string}`, data: `0x${string}`;
    if (version === 1) {
      to = tokenManagerAddress;
      data = encodeFunctionData({
        abi: TOKEN_MANAGER_V1_ABI,
        functionName: 'purchaseTokenAMAP',
        args: [
          tokenAddress as `0x${string}`,
          buyParams.amountFunds,
          0n // minAmount
        ]
      });
    } else {
      to = tokenManagerAddress;
      data = encodeFunctionData({
        abi: TOKEN_MANAGER_V2_ABI,
        functionName: 'buyTokenAMAP',
        args: [
          tokenAddress as `0x${string}`,
          buyParams.amountFunds,
          0n // minAmount
        ]
      });
    }

    console.log("data:", data)
    
    // Sign transaction
    const signature = await walletClient.signTransaction({
      account: walletClient.account,
      nonce: nonce,
      to: to,
      value: buyParams.amountMsgValue,
      chain: bsc,
      gasPrice: parseUnits("3", "gwei"),
      gas: BUY_GAS_LIMIT,
      data: data
    });
    
    
    txs.push(signature.slice(2));
  }
  
  // Submit bundle
  const bundle = await sendBundleTxs(txs);

  return { txHash: bundle.result?.bundleHash || "Bundle submitted" };
};

export const sellTokens = async (
  tokenAddress: string,
  sellPercentage: number,
  userId: string
): Promise<{ txHash: string }> => {
  console.log("sellTokens:", tokenAddress, sellPercentage, userId)
  const wallets = loadWallets(userId);
  if (wallets.length === 0) {
    throw new Error('No wallets found. Create wallets first.');
  }
  if (sellPercentage <= 0 || sellPercentage > 100) {
    throw new Error('Sell percentage must be between 1 and 100');
  }
  
  // Get token info to determine which version of TokenManager to use
  const tokenInfo = await getTokenInfo(tokenAddress);
  const tokenManagerAddress = tokenInfo.tokenManager;
  const version = tokenInfo.version;

  const txs = [];
  
  // Prepare transactions for each wallet
  for (const wallet of wallets) {
  // const wallet = wallets[0]
    const walletClient = getWalletClient(wallet.privateKey as `0x${string}`);    
    let nonce = await getWalletNonce(walletClient.account.address);
    const balance = await getTokenBalance(tokenAddress, walletClient.account.address);
    // Skip if wallet doesn't have any tokens
    if (balance <= 0n) {
       console.log(`Wallet ${walletClient.account.address} has no tokens`);
       continue;
    }
    const amountToSell = balance * BigInt(sellPercentage) / 100n;
    console.log("amountToSell:", amountToSell)
    console.log("balance:", balance)

    // Check current allowance
    const allowance = await getTokenAllowance(tokenAddress, walletClient.account.address, tokenManagerAddress);
    /**
     * ================================
     * APPROVE
     * ================================
     */
    if (allowance < amountToSell) {
      console.log(`Current allowance (${allowance}) is less than amount to sell (${amountToSell}). Approving max value.`);

      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [tokenManagerAddress, maxUint256]
      });

      const approveSignature = await walletClient.signTransaction({
        account: walletClient.account,
        nonce: nonce,
        to: tokenAddress as `0x${string}`,
        value: 0n,
        chain: bsc,
        gasPrice: parseUnits("3", "gwei"),
        gas: APPROVE_GAS_LIMIT,
        data: approveData
      });

      txs.push(approveSignature.slice(2));
      nonce++;
    } else {
      console.log(`Current allowance (${allowance}) is sufficient for amount to sell (${amountToSell}). Skipping approval.`);
    }

    console.log("version:", version)
    console.log("nonce:", nonce)
    console.log("tokenManagerAddress:", tokenManagerAddress)
    console.log("amountToSell:", amountToSell)
    console.log("tokenAddress:", tokenAddress)
    const roundedAmount = (amountToSell / 1000000000000n) * 1000000000000n;
    console.log("roundedAmount:", roundedAmount)

    /**
     * ================================
     * SELL
     * ================================
     */
    let sellData: `0x${string}`;
    if (version === 1) {
      // Use V1 TokenManager
      sellData = encodeFunctionData({
        abi: TOKEN_MANAGER_V1_ABI,
        functionName: 'saleToken',
        args: [tokenAddress as `0x${string}`, roundedAmount]
      });
    } else {
      // Use V2 TokenManager
      sellData = encodeFunctionData({
        abi: TOKEN_MANAGER_V2_ABI,
        functionName: 'sellToken',
        args: [tokenAddress as `0x${string}`, roundedAmount]
      });
      // const gas = await publicClient.estimateContractGas({
      //   address: tokenManagerAddress,
      //   abi: TOKEN_MANAGER_V2_ABI,
      //   functionName: 'sellToken',
      //   args: [tokenAddress as `0x${string}`, roundedAmount],
      //   account: walletClient.account.address,
      // })
      // console.log("gas:", gas)
      // const hash = await walletClient.writeContract({
      //   address: tokenManagerAddress,
      //   abi: TOKEN_MANAGER_V2_ABI,
      //   functionName: 'sellToken',
      //   args: [tokenAddress as `0x${string}`, roundedAmount],
      //   gas: 1000000n,
      //   gasPrice: parseUnits("3", "gwei"),
      //   chain: bsc
      // });
      // console.log("hash:", hash)four
    }
    console.log("Sell data:", sellData);
    const sellSignature = await walletClient.signTransaction({
      account: walletClient.account,
      nonce: nonce,
      to: tokenManagerAddress,
      value: 0n,
      chain: bsc,
      gasPrice: parseUnits("5", "gwei"),
      gas: SELL_GAS_LIMIT * 2n, // Higher gas limit for token sales
      data: sellData
    });

    txs.push(sellSignature.slice(2));
  }
  
  // If no transactions were created, return early
  if (txs.length === 0) {
    throw new Error('No wallets have any token balance to sell');
  }

  console.log("txs:", txs);
  
  // Submit bundle
  const bundle = await sendBundleTxs(txs);

  // console.log("bundle.result.results[0].revert:", decodeRevertReason(bundle.result.results[0].revert))

  return { txHash: bundle.result?.bundleHash || "Bundle submitted" };
  // return { txHash: "Bundle submitted" };
};


// Decode revert reason from binary data
export const decodeRevertReason = (revertData: string | Uint8Array): string => {
  try {
    // Convert to hex if it's not already
    let hexData;
    if (typeof revertData === 'string' && revertData.startsWith('0x')) {
      hexData = revertData;
    } else if (typeof revertData === 'string') {
      // Handle string that's not a hex string
      hexData = '0x' + Buffer.from(revertData).toString('hex');
    } else {
      // Handle Uint8Array
      hexData = '0x' + Buffer.from(revertData).toString('hex');
    }

    console.log("Hex revert data:", hexData);
    
    // Check if it's a standard error
    if (hexData.startsWith('0x08c379a0')) {
      // This is a standard error string
      try {
        const result = decodeErrorResult({
          abi: [{ 
            type: 'error',
            name: 'Error',
            inputs: [{ type: 'string', name: 'message' }]
          }],
          data: hexData as `0x${string}`
        });
        return `Error: ${result.args[0]}`;
      } catch (e) {
        console.error("Failed to decode standard error:", e);
      }
    }
    
    // Check if it's a panic error
    if (hexData.startsWith('0x4e487b71')) {
      try {
        const result = decodeErrorResult({
          abi: [{ 
            type: 'error',
            name: 'Panic',
            inputs: [{ type: 'uint256', name: 'code' }]
          }],
          data: hexData as `0x${string}`
        });
        const panicCode = result.args[0];
        return `Panic: ${getPanicMessage(panicCode)}`;
      } catch (e) {
        console.error("Failed to decode panic error:", e);
      }
    }
    
    // Try to decode as a custom error
    try {
      // Common custom errors in token contracts
      const customErrors = [
        { name: 'InsufficientBalance', inputs: [{ type: 'uint256', name: 'available' }, { type: 'uint256', name: 'required' }] },
        { name: 'TransferFailed', inputs: [] },
        { name: 'Unauthorized', inputs: [] },
        { name: 'InvalidAmount', inputs: [] },
        { name: 'TradingNotEnabled', inputs: [] },
        { name: 'ExceedsMaxSellAmount', inputs: [{ type: 'uint256', name: 'maxAmount' }] },
        { name: 'SellCooldown', inputs: [{ type: 'uint256', name: 'timeRemaining' }] }
      ];
      
      for (const errorDef of customErrors) {
        try {
          const result = decodeErrorResult({
            abi: [{ type: 'error', name: errorDef.name, inputs: errorDef.inputs }],
            data: hexData as `0x${string}`
          });
          
          let errorMsg = `${errorDef.name}`;
          if (result.args && result.args.length > 0) {
            errorMsg += `: ${result.args.join(', ')}`;
          }
          return errorMsg;
        } catch (e) {
          // This wasn't the right error, continue trying
        }
      }
    } catch (e) {
      console.error("Failed to decode as custom error:", e);
    }
    
    // If we couldn't decode it, try to extract any readable parts
    let readableParts = '';
    for (let i = 2; i < hexData.length; i += 2) {
      const charCode = parseInt(hexData.slice(i, i + 2), 16);
      if (charCode >= 32 && charCode <= 126) { // Printable ASCII
        readableParts += String.fromCharCode(charCode);
      }
    }
    
    if (readableParts.length > 0) {
      return `Unknown error with readable parts: ${readableParts}`;
    }
    
    // If all else fails, return the raw hex
    return `Unknown error: ${hexData}`;
  } catch (error) {
    console.error("Error decoding revert reason:", error);
    return `Failed to decode error: ${error}`;
  }
};

// Get panic error message
function getPanicMessage(code: bigint): string {
  const panicCodes: Record<string, string> = {
    '0x1': 'Assertion failed',
    '0x11': 'Arithmetic operation underflowed or overflowed',
    '0x12': 'Division or modulo by zero',
    '0x21': 'Tried to convert a value into an enum but the value was too big or negative',
    '0x22': 'Tried to access a storage byte array that is incorrectly encoded',
    '0x31': 'Called .pop() on an empty array',
    '0x32': 'Array index out of bounds',
    '0x41': 'Too much memory allocated',
    '0x51': 'Called a zero-initialized variable of internal function type'
  };
  
  const hexCode = `0x${code.toString(16)}`;
  return panicCodes[hexCode] || `Unknown panic code: ${hexCode}`;
}
