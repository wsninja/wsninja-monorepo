import { IWalletAction } from 'store/wallet/types';
import { IToken, ITransaction } from 'types';

export const updateTokens = (tokens: Array<IToken>): IWalletAction => ({
	type: 'updateTokens',
	payload: { tokens },
});

export const updateTransactions = (transactions: Array<ITransaction>): IWalletAction => ({
	type: 'updateTransactions',
	payload: { transactions },
});

export const addHiddenToken = (chainId: bigint, address: string): IWalletAction => ({
	type: 'addHiddenToken',
	payload: { chainId, address },
});

export const deleteHiddenToken = (chainId: bigint, address: string): IWalletAction => ({
	type: 'deleteHiddenToken',
	payload: { chainId, address },
});

export const updateHiddenTokens = (hiddenTokens: Array<{ chainId: bigint; address: string }>): IWalletAction => ({
	type: 'updateHiddenTokens',
	payload: { hiddenTokens },
});
