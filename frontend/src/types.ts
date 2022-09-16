import {
	IGetCustomTokensResponse,
	IGetNotificationsResponse,
	IGetTokenPriceResponse,
	IGetTransactionsResponse,
} from 'utils/api/types';

export type IChain = 'bitcoin' | 'bsc' | 'ethereum' | 'polygon';

export type ITransactionType = IGetTransactionsResponse['transactions'][0]['type'];

export type ICustomToken = IGetCustomTokensResponse['customTokens'][0];

export type INotification = IGetNotificationsResponse['notifications'][0];

export type ITokenPrice = Exclude<IGetTokenPriceResponse['tokenPrice'], undefined>;

export interface IToken {
	tokenHash: string;
	chain: IChain;
	address: string;
	name: string;
	symbol: string;
	logoUri: string;
	price: number | undefined;
	decimals: bigint;
	amount: bigint;
	amountInUSD: number;
	priceChangePercentage24h: number | undefined;
}

export interface ITransaction {
	chain: IChain;
	transactionHash: string;
	type: 'received' | 'sent' | 'exchanged' | 'transfered' | 'called';
	date: Date;
	successful: boolean;
	fromAddress: string;
	toAddress: string;
	value: bigint;
	valueUnit: string;
	usedGas: bigint;
	decimals: bigint;
	exchange?: {
		srcAddress: string;
		destAddress: string;
		srcTokenAddress: string;
		destTokenAddress: string;
		srcAmount: bigint;
		destAmount: bigint;
		srcDecimals: bigint;
		destDecimals: bigint;
	};
	transfer?: {
		srcAddress: string;
		destAddress: string;
		tokenAddress: string;
		amount: bigint;
		decimals: bigint;
	};
}

export interface ITransactionInfo {
	chain: IChain;
	transactionHash: string;
	nonce: bigint;
	valuePriceInUSD: number;
}

export interface INetwork {
	chain: IChain;
	chainId?: bigint;
	label: string;
	logo: string;
	banner: string;
	getTransactionLink: (transactionHash: string) => string;
	explorerName: string;
	symbol: string;
}

export interface ITransactionData {
	from: string;
	to: string;
	value: string;
	data?: string;
	gas: string;
	gasPrice: string;
	nonce: number;
}

export interface ISwapToken {
	chainId: bigint;
	symbol: string;
	name: string;
	address: string;
	decimals: bigint;
	logoUri: string;
	priceInUsd?: number;
	balance: string;
}

export interface ISwapTokenFilter {
	chainId: bigint;
	address: string;
}

export interface IStringIndexed<T> {
	[key: string]: T;
}
