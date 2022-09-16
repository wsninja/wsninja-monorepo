import {
	addWalletTokensToCustomTokens,
	estimateGas,
	getBalances,
	getChainCoinPrice,
	getGasPrice,
	getHistoricValuePrice,
	getNonce,
	getTransactionInfo,
	getTransactions,
	getWalletTokens,
	sendTransaction,
} from 'controllers/wallet';
import { AsyncRouter } from 'express-async-router';

export const walletRouter = AsyncRouter();

walletRouter.post('/sendTransaction', sendTransaction);
walletRouter.post('/getBalances', getBalances);
walletRouter.post('/getGasPrice', getGasPrice);
walletRouter.post('/getChainCoinPrice', getChainCoinPrice);
walletRouter.post('/getWalletTokens', getWalletTokens);
walletRouter.post('/addWalletTokensToCustomTokens', addWalletTokensToCustomTokens);
walletRouter.post('/getTransactions', getTransactions);
walletRouter.post('/getTransactionInfo', getTransactionInfo);
walletRouter.post('/getNonce', getNonce);
walletRouter.post('/estimateGas', estimateGas);
walletRouter.post('/getHistoricValuePrice', getHistoricValuePrice);
