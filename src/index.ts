import { Telegraf } from 'telegraf';
import { createWallets, distributeTokens, getWallets, getWalletsAddresses } from './services/wallet';
import { buyTokens, sellTokens } from './services';
import { isAddress } from 'ethers';
import { getTotalTokenBalance, getUserTokenBalances } from './services/tokens';
import { BOT_TOKEN } from './utils/config';

const bot = new Telegraf(BOT_TOKEN || '');

bot.command('start', (ctx) => {
  ctx.reply('Welcome to Four.meme Manager Bot! Use /help to see available commands.');
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/create - Create 10 BSC wallets\n' +
    '/distribute <amount> - Distribute BNB to created wallets\n' +
    '/buy <tokenAddress> <amount> - Buy token on four.meme\n' +
    '/sell <tokenAddress> <sellPercentage> - Sell token on four.meme\n' +
    '/tokens <tokenAddress> - Show token balances for all wallets\n' +
    '/wallets - Show all created wallets'
  );
});

bot.command('create', async (ctx) => {
  const userId = ctx.from.id.toString();
  const count = 7;
  const wallets = getWalletsAddresses(userId);
  if (wallets.length > 0) {
    let message = 'You already have wallets:\n\n';
    wallets.forEach((wallet, index) => {
      message += `${index + 1}. Address: ${wallet}\n\n`;
    });
    ctx.reply(message);
  } else {
    try {
      const wallets = await createWallets(count, userId);
      console.log("wallets", wallets);
      ctx.reply(`Successfully created ${count} wallets!`);
    } catch (error) {
      ctx.reply(`Error creating wallets: ${error}`);
    }  
  }
});

bot.command('distribute', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const amount = parseFloat(args[1]);
  
  if (!amount || amount <= 0) {
    return ctx.reply('Please specify a valid amount to distribute');
  }

  const userId = ctx.from.id.toString();
  
  try {
    const result = await distributeTokens(amount, userId);
    ctx.reply(`Successfully distributed ${amount} BNB to ${result.count} wallets!`);
  } catch (error) {
    ctx.reply(`Error distributing BNB: ${error}`);
  }
});

bot.command('wallets', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const wallets = await getWallets(userId);
    if (wallets.length === 0) {
      return ctx.reply('No wallets created yet. Use /create to create some.');
    }
    
    let message = 'My wallets:\n\n';
    wallets.forEach((wallet, index) => {
      message += `${index + 1}. Address: ${wallet.address}\n Key: ${wallet.privateKey}\n  Balance: ${wallet.balance} BNB\n\n`;
    });
    
    ctx.reply(message);
  } catch (error) {
    ctx.reply(`Error fetching wallets: ${error}`);
  }
});

bot.command('buy', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const tokenAddress = args[1];
  const bnbAmount = parseFloat(args[2]);
  const userId = ctx.from.id.toString();
  
  if (!tokenAddress || !isAddress(tokenAddress)) {
    return ctx.reply('Please provide a valid token address');
  }
  
  if (!bnbAmount || bnbAmount <= 0) {
    return ctx.reply('Please specify a valid BNB amount to spend per wallet');
  }
  
  try {
    await ctx.reply(`Buying ${tokenAddress} with ${bnbAmount} BNB from each wallet...`);
    const result = await buyTokens(tokenAddress, bnbAmount, userId);
    ctx.reply(`Transaction submitted! Bundle hash: ${result.txHash}`);
  } catch (error) {
    console.error('Error buying tokens:', error);
    ctx.reply(`Error buying tokens: ${error}`);
  }
});

bot.command('sell', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const tokenAddress = args[1];
  const sellPercentage = parseInt(args[2]);
  const userId = ctx.from.id.toString();

  if (!tokenAddress || !isAddress(tokenAddress)) {
    return ctx.reply('Please provide a valid token address');
  }

  if (isNaN(sellPercentage) || sellPercentage <= 0 || sellPercentage > 100) {
    return ctx.reply('Please specify a valid percentage between 1 and 100');
  }
  
  try {
    await ctx.reply(`Selling ≈${sellPercentage}% of tokens from ${tokenAddress} from each wallet...`);
    const result = await sellTokens(tokenAddress, sellPercentage, userId);
    ctx.reply(`Transaction submitted! Bundle hash: ${result.txHash}`);
  } catch (error) {
    console.error('Error selling tokens:', error);
    ctx.reply(`Error selling tokens: ${error}`);
  }
});

// Show token balances for all wallets
bot.command('tokens', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const tokenAddress = args[1];
  const userId = ctx.from.id.toString();
  
  if (!tokenAddress || !isAddress(tokenAddress)) {
    return ctx.reply('Please provide a valid token address');
  }
  
  try {
    await ctx.reply(`Fetching token balances for ${tokenAddress}...`);
    
    // Get token info and balances
    const balances = await getUserTokenBalances(userId, tokenAddress);
    const totalInfo = await getTotalTokenBalance(userId, tokenAddress);
    
    if (balances.length === 0) {
      return ctx.reply('No wallets found. Use /create to create some wallets first.');
    }
    
    // Format the message
    let message = `Token: ${totalInfo.tokenName} (${totalInfo.tokenSymbol})\n`;
    message += `Address: ${tokenAddress}\n\n`;
    message += `Total Balance: ${totalInfo.totalBalance} ${totalInfo.tokenSymbol}\n\n`;
    message += `Individual Wallet Balances:\n`;
    
    balances.forEach((item, index) => {
      if (item.balanceRaw > 0n) {
        message += `${index + 1}. Address: ${item.address.substring(0, 8)}...${item.address.substring(36)}\n`;
        message += `   Balance: ${item.balance} ${item.tokenSymbol}\n\n`;
      }
    });
    
    const zeroBalanceCount = balances.filter(item => item.balanceRaw === 0n).length;
    if (zeroBalanceCount > 0) {
      message += `${zeroBalanceCount} wallets have zero balance.`;
    }
    
    ctx.reply(message);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    ctx.reply(`Error fetching token balances: ${error}`);
  }
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot started successfully!');
}).catch((err) => {
  console.error('Failed to start bot:', err);
});
