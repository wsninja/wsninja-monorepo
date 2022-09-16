import { IPayloadAction } from 'store/types';
import { IToken, ITransaction } from 'types';

export interface IWalletState {
	tokens: Array<IToken>;
	transactions: Array<ITransaction>;
	hiddenTokens: Array<{ chainId: bigint; address: string }>;
}

type IUpdateTokens = IPayloadAction<'updateTokens', { tokens: Array<IToken> }>;

type IUpdateTransactions = IPayloadAction<'updateTransactions', { transactions: Array<ITransaction> }>;

type IAddHiddenToken = IPayloadAction<'addHiddenToken', { chainId: bigint; address: string }>;

type IDeleteHiddenToken = IPayloadAction<'deleteHiddenToken', { chainId: bigint; address: string }>;

type IUpdateHiddenTokens = IPayloadAction<
	'updateHiddenTokens',
	{ hiddenTokens: Array<{ chainId: bigint; address: string }> }
>;

export type IWalletAction =
	| IUpdateTokens
	| IUpdateTransactions
	| IAddHiddenToken
	| IDeleteHiddenToken
	| IUpdateHiddenTokens;
