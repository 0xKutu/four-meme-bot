"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// import { createWallets, distributeTokens, buyToken, sellToken } from './services';
dotenv_1.default.config();
// const bot = new Telegraf(process.env.BOT_TOKEN || '');
console.log("Test");
// // Command handlers
// bot.command('start', (ctx) => {
//   ctx.reply('Welcome to BSC Wallet Manager Bot! Use /help to see available commands.');
// });
// bot.command('help', (ctx) => {
//   ctx.reply(
//     'Available commands:\n' +
//     '/createwallets <count> - Create multiple BSC wallets (10-20)\n' +
//     '/distribute <amount> - Distribute BNB to created wallets\n' +
//     '/buy <tokenAddress> <amount> - Buy token on four.meme\n' +
//     '/sell <tokenAddress> <amount> - Sell token on four.meme\n' +
//     '/wallets - Show all created wallets'
//   );
// });
// bot.command('createwallets', async (ctx) => {
//   const args = ctx.message.text.split(' ');
//   const count = parseInt(args[1]) || 10;
//   if (count < 10 || count > 20) {
//     return ctx.reply('Please specify a number between 10 and 20');
//   }
//   try {
//     const wallets = await createWallets(count);
//     ctx.reply(`Successfully created ${wallets.length} wallets!`);
//   } catch (error) {
//     ctx.reply(`Error creating wallets: ${error.message}`);
//   }
// });
// bot.command('distribute', async (ctx) => {
//   const args = ctx.message.text.split(' ');
//   const amount = parseFloat(args[1]);
//   if (!amount || amount <= 0) {
//     return ctx.reply('Please specify a valid amount to distribute');
//   }
//   try {
//     const result = await distributeTokens(amount);
//     ctx.reply(`Successfully distributed ${amount} BNB to ${result.count} wallets!`);
//   } catch (error) {
//     ctx.reply(`Error distributing BNB: ${error.message}`);
//   }
// });
// bot.command('buy', async (ctx) => {
//   const args = ctx.message.text.split(' ');
//   const tokenAddress = args[1];
//   const amount = parseFloat(args[2]);
//   if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
//     return ctx.reply('Please specify a valid token address');
//   }
//   if (!amount || amount <= 0) {
//     return ctx.reply('Please specify a valid amount to buy');
//   }
//   try {
//     const result = await buyToken(tokenAddress, amount);
//     ctx.reply(`Successfully bought token! Transaction hash: ${result.txHash}`);
//   } catch (error) {
//     ctx.reply(`Error buying token: ${error.message}`);
//   }
// });
// bot.command('sell', async (ctx) => {
//   const args = ctx.message.text.split(' ');
//   const tokenAddress = args[1];
//   const amount = parseFloat(args[2]);
//   if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
//     return ctx.reply('Please specify a valid token address');
//   }
//   if (!amount || amount <= 0) {
//     return ctx.reply('Please specify a valid amount to sell');
//   }
//   try {
//     const result = await sellToken(tokenAddress, amount);
//     ctx.reply(`Successfully sold token! Transaction hash: ${result.txHash}`);
//   } catch (error) {
//     ctx.reply(`Error selling token: ${error.message}`);
//   }
// });
// bot.command('wallets', async (ctx) => {
//   try {
//     const wallets = await getWallets();
//     if (wallets.length === 0) {
//       return ctx.reply('No wallets created yet. Use /createwallets to create some.');
//     }
//     let message = 'Created wallets:\n\n';
//     wallets.forEach((wallet, index) => {
//       message += `${index + 1}. Address: ${wallet.address}\n   Balance: ${wallet.balance} BNB\n\n`;
//     });
//     ctx.reply(message);
//   } catch (error) {
//     ctx.reply(`Error fetching wallets: ${error.message}`);
//   }
// });
// // Start the bot
// bot.launch().then(() => {
//   console.log('Bot started successfully!');
// }).catch((err) => {
//   console.error('Failed to start bot:', err);
// });
// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));
