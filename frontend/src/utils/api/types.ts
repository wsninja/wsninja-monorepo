import { ITransactionData } from 'types';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

export interface IBaseRequest<T> {
	payload: T;
}

export interface ISignedRequest<T> extends IBaseRequest<T> {
	securityToken: string;
}

export interface ISendTransactionRequest {
	chainId: bigint;
	signedTransaction: string;
}

export interface ISendTransactionResponse {
	transactionReceipt: TransactionReceipt;
}

export interface IGetAllowanceTransactionRequest {
	publicKey: string;
	chainId: string;
	fromTokenAddress: string;
	amount: string;
}

export interface IGetAllowanceTransactionResponse {
	data?: ITransactionData;
}

export interface IGetSwapTokensResponse {
	data: Array<{
		chainId: string;
		symbol: string;
		name: string;
		address: string;
		decimals: string;
		logoUri: string;
		priceInUsd?: number;
	}>;
}

export interface IGetSwapTransactionRequest {
	publicKey: string;
	chainId: string;
	fromTokenAddress: string;
	toTokenAddress: string;
	amount: string;
	allowPartialFill: boolean;
	slippage: number;
}

export interface IGetSwapTransactionResponse {
	data?: ITransactionData;
}

export interface IGetTokenPriceRequest {
	tokenSymbol: string;
}

export interface IGetTokenPriceResponse {
	tokenPrice?: {
		symbol: string;
		price: number | undefined;
		priceChange24h: number;
		priceChangePercentage24h: number | null;
		priceLow24h: number;
		priceHigh24h: number;
		logoUri: string;
	};
}

export interface IGetBalancesRequest {
	publicKey: string;
	chainId: string;
}

export interface IGetBalancesResponse {
	data: Array<{
		tokenAddress: string;
		balance: string;
	}>;
}

export interface IGetGasPriceRequest {
	chainId: string;
}

export interface IGetGasPriceResponse {
	data: string;
}

export interface IGetChainCoinPriceRequest {
	chainId: string;
}

export interface IGetChainCoinPriceResponse {
	data: number;
}

export interface IGetReferrerFeeResponse {
	data: number;
}

export interface IAddUserRequest {
	publicKey: string;
	isoDate: string;
	v: string;
	r: string;
	s: string;
}

export interface IAddUserResponse {
	securityToken: string;
	newUser: boolean;
}

export interface ISetAskPasswordOnTransactionRequest {
	value: boolean;
}

export interface ISetIsSessionTimeoutRequest {
	value: boolean;
}

export interface IGetUserSettingsResponse {
	askPasswordOnTransaction: boolean;
	isSessionTimeout: boolean;
}

export interface IGetWalletTokensRequest {
	chainId: bigint;
}

export interface IGetWalletTokensResponse {
	tokens: Array<{
		tokenHash: string;
		chainId: bigint;
		address: string;
		name: string;
		symbol: string;
		logoUri: string;
		price: number | undefined;
		decimals: bigint;
		amount: bigint;
		amountInUSD: number;
		priceChangePercentage24h: number | undefined;
	}>;
}

export interface IGetTransactionsRequest {
	chainId: bigint;
}

export interface IGetTransactionsResponse {
	transactions: Array<{
		chainId: bigint;
		transactionHash: string;
		type: 'received' | 'sent' | 'exchanged' | 'transfered' | 'called';
		date: Date;
		successful: boolean;
		fromAddress: string;
		toAddress: string;
		value: bigint;
		valueUnit: string;
		usedGas: bigint;
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
	}>;
}

export interface IGetTransactionInfoRequest {
	chainId: bigint;
	transactionHash: string;
	date: Date;
}

export interface IGetTransactionInfoResponse {
	transactionInfo: {
		chainId: bigint;
		transactionHash: string;
		nonce: bigint;
		valuePriceInUSD: number;
	};
}

export interface IGetNonceRequest {
	chainId: bigint;
}

export interface IGetNonceResponse {
	nonce: bigint;
}

export interface IEstimateGasRequest {
	chainId: bigint;
	transactionData: TransactionConfig;
}

export interface IEstimateGasResponse {
	gas: bigint;
}

export interface IAddCustomTokenRequest {
	chainId: bigint;
	address: string;
}

export interface IGetCustomTokensResponse {
	customTokens: Array<{
		chainId: bigint;
		address: string;
		name: string;
		symbol: string;
		logoUri: string;
	}>;
}

export interface IAddNotificationRequest {
	heading: string;
	description: string;
	metadata: string;
}

export interface IAddNotificationResponse {
	notificationId: bigint;
}

export interface IMarkNotificationReadRequest {
	notificationId: bigint;
}

export interface IDeleteNotificationsRequest {
	notificationIds: Array<bigint>;
}

export interface IGetNotificationsResponse {
	notifications: Array<{
		id: bigint;
		heading: string;
		description: string;
		metadata: string;
		isRead: boolean;
		createdAt: Date;
	}>;
}

export interface IAddWatchedTokenRequest {
	tokenSymbol: string;
}

export interface IDeleteWatchedTokenRequest {
	tokenSymbol: string;
}

export interface IGetWatchedTokensResponse {
	watchedTokens: Array<{ symbol: string }>;
}
