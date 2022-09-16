import { parse, stringify } from '@softstack/typed-stringify';
import axios from 'axios';
import { BACKEND_URL } from 'constants/env';
import { addHexPrefix, ecsign, keccak256, privateToPublic, toBuffer } from 'ethereumjs-util';
import { Store } from 'redux';
import { logout } from 'store/user/actions';
import { ISwapToken, IToken, ITransaction, ITransactionData, ITransactionInfo } from 'types';
import {
	IAddCustomTokenRequest,
	IAddNotificationRequest,
	IAddNotificationResponse,
	IAddUserRequest,
	IAddUserResponse,
	IAddWatchedTokenRequest,
	IDeleteNotificationsRequest,
	IDeleteWatchedTokenRequest,
	IEstimateGasRequest,
	IEstimateGasResponse,
	IGetAllowanceTransactionRequest,
	IGetAllowanceTransactionResponse,
	IGetBalancesRequest,
	IGetBalancesResponse,
	IGetChainCoinPriceRequest,
	IGetChainCoinPriceResponse,
	IGetCustomTokensResponse,
	IGetGasPriceRequest,
	IGetGasPriceResponse,
	IGetNonceRequest,
	IGetNonceResponse,
	IGetNotificationsResponse,
	IGetReferrerFeeResponse,
	IGetSwapTokensResponse,
	IGetSwapTransactionRequest,
	IGetSwapTransactionResponse,
	IGetTokenPriceRequest,
	IGetTokenPriceResponse,
	IGetTransactionInfoRequest,
	IGetTransactionInfoResponse,
	IGetTransactionsRequest,
	IGetTransactionsResponse,
	IGetUserSettingsResponse,
	IGetWalletTokensRequest,
	IGetWalletTokensResponse,
	IGetWatchedTokensResponse,
	IMarkNotificationReadRequest,
	ISendTransactionRequest,
	ISendTransactionResponse,
	ISetAskPasswordOnTransactionRequest,
	ISetIsSessionTimeoutRequest,
	ISignedRequest,
} from 'utils/api/types';
import { getChain } from 'utils/utils';

const instance = axios.create({ baseURL: BACKEND_URL });

export const initInterceptor = (store: Store) => {
	instance.interceptors.response.use(
		(response) => response,
		(error) => {
			if (typeof error?.response?.data?.error === 'string') {
				if (error?.response?.status === 401) {
					store.dispatch(logout());
					window.location.href = window.location.origin;
				}
				return Promise.reject(new Error(error.response.data.error));
			}
			return Promise.reject(error);
		}
	);
};

export const post = async <T>(path: string, payload: unknown): Promise<T> => {
	const response = await instance.post<{ data: string | undefined }>(path, { data: stringify({ payload }) });
	const { data: responseData } = response.data;
	if (typeof responseData === 'string') {
		return parse(responseData) as T;
	}
	throw new Error('Invalid response type');
};

export const signedPost = async <T>(path: string, payload: unknown, securityToken: string): Promise<T> => {
	const requestData: ISignedRequest<unknown> = {
		securityToken,
		payload,
	};
	const response = await instance.post<{ data: string | undefined }>(path, { data: stringify(requestData) });
	const { data: responseData } = response.data;
	if (typeof responseData === 'string') {
		return parse(responseData) as T;
	}
	throw new Error('Invalid response type');
};

export const sendTransaction = (payload: ISendTransactionRequest, securityToken: string) =>
	signedPost<ISendTransactionResponse>('/api/wallet/sendTransaction', payload, securityToken);

export const getSwapTokens = (): Promise<Array<ISwapToken>> =>
	instance.post<IGetSwapTokensResponse>('/api/swap/getTokens').then((response) =>
		response.data.data.map((token) => {
			const { chainId, decimals } = token;
			return {
				...token,
				chainId: BigInt(chainId),
				decimals: BigInt(decimals),
				balance: '0',
			};
		})
	);

export const getAllowanceTransaction = (
	publicKey: string,
	chainId: bigint,
	fromTokenAddress: string,
	amount: bigint
): Promise<ITransactionData | undefined> =>
	instance
		.post<IGetAllowanceTransactionResponse>('/api/swap/getAllowanceTransaction', {
			publicKey,
			chainId: chainId.toString(),
			fromTokenAddress,
			amount: amount.toString(),
		} as IGetAllowanceTransactionRequest)
		.then((response) => response.data.data);

export const getSwapTransaction = (
	publicKey: string,
	chainId: bigint,
	fromTokenAddress: string,
	toTokenAddress: string,
	amount: bigint,
	allowPartialFill: boolean,
	slippage: number
): Promise<ITransactionData | undefined> =>
	instance
		.post<IGetSwapTransactionResponse>('/api/swap/getSwapTransaction', {
			publicKey,
			chainId: chainId.toString(),
			fromTokenAddress,
			toTokenAddress,
			amount: amount.toString(),
			allowPartialFill,
			slippage,
		} as IGetSwapTransactionRequest)
		.then((response) => response.data.data);

export const getTokenPrice = (payload: IGetTokenPriceRequest, securityToken: string) =>
	signedPost<IGetTokenPriceResponse>('/api/token/getTokenPrice', payload, securityToken);

export const getBalances = (chainId: bigint, publicKey: string) =>
	instance
		.post<IGetBalancesResponse>('/api/wallet/getBalances', {
			publicKey,
			chainId: chainId.toString(),
		} as IGetBalancesRequest)
		.then((response) => response.data.data);

export const getGasPrice = (chainId: bigint): Promise<bigint> =>
	instance
		.post<IGetGasPriceResponse>('/api/wallet/getGasPrice', { chainId: chainId.toString() } as IGetGasPriceRequest)
		.then((response) => BigInt(response.data.data));

export const getChainCoinPrice = (chainId: bigint): Promise<number> =>
	instance
		.post<IGetChainCoinPriceResponse>('/api/wallet/getChainCoinPrice', {
			chainId: chainId.toString(),
		} as IGetChainCoinPriceRequest)
		.then((response) => response.data.data);

export const getReferrerFee = (): Promise<number> =>
	instance.post<IGetReferrerFeeResponse>('/api/swap/getReferrerFee').then((response) => response.data.data);

export const addUser = async (privateKey: string): Promise<IAddUserResponse> => {
	const publicKey = privateToPublic(toBuffer(addHexPrefix(privateKey))).toString('hex');
	const isoDate = new Date().toISOString();
	const hash = keccak256(Buffer.from(isoDate, 'utf8'));
	const { r, s, v } = ecsign(hash, toBuffer(addHexPrefix(privateKey)));
	const requestData: IAddUserRequest = {
		publicKey,
		isoDate,
		r: r.toString('hex'),
		s: s.toString('hex'),
		v: v.toString(16),
	};
	return post<IAddUserResponse>('/api/user/addUser', requestData);
};

export const setAskPasswordOnTransaction = (
	payload: ISetAskPasswordOnTransactionRequest,
	securityToken: string
): Promise<void> => signedPost('/api/user/setAskPasswordOnTransaction', payload, securityToken);

export const setIsSessionTimeout = (payload: ISetIsSessionTimeoutRequest, securityToken: string): Promise<void> =>
	signedPost('/api/user/setIsSessionTimeout', payload, securityToken);

export const getUserSettings = (securityToken: string): Promise<IGetUserSettingsResponse> =>
	signedPost('/api/user/getUserSettings', undefined, securityToken);

export const getWalletTokens = async (
	payload: IGetWalletTokensRequest,
	securityToken: string
): Promise<Array<IToken>> => {
	const { tokens } = await signedPost<IGetWalletTokensResponse>('/api/wallet/getWalletTokens', payload, securityToken);
	return tokens.map((token) => ({
		...token,
		chain: getChain(token.chainId),
	}));
};

export const addWalletTokensToCustomTokens = (securityToken: string) =>
	signedPost('/api/wallet/addWalletTokensToCustomTokens', undefined, securityToken);

export const getTransactions = async (
	payload: IGetTransactionsRequest,
	securityToken: string
): Promise<Array<ITransaction>> => {
	const { transactions } = await signedPost<IGetTransactionsResponse>(
		'/api/wallet/getTransactions',
		payload,
		securityToken
	);
	return transactions.map((transaction) => ({
		...transaction,
		chain: getChain(transaction.chainId),
		decimals: 18n,
	}));
};

export const getTransactionInfo = async (
	payload: IGetTransactionInfoRequest,
	securityToken: string
): Promise<ITransactionInfo> => {
	const { transactionInfo } = await signedPost<IGetTransactionInfoResponse>(
		'/api/wallet/getTransactionInfo',
		payload,
		securityToken
	);
	return {
		...transactionInfo,
		chain: getChain(transactionInfo.chainId),
	};
};

export const getNonce = (payload: IGetNonceRequest, securityToken: string): Promise<IGetNonceResponse> =>
	signedPost('/api/wallet/getNonce', payload, securityToken);

export const estimateGas = (payload: IEstimateGasRequest, securityToken: string): Promise<IEstimateGasResponse> =>
	signedPost('/api/wallet/estimateGas', payload, securityToken);

export const addCustomToken = (payload: IAddCustomTokenRequest, securityToken: string): Promise<void> =>
	signedPost('/api/token/addCustomToken', payload, securityToken);

export const getCustomTokens = (securityToken: string): Promise<IGetCustomTokensResponse> =>
	signedPost('/api/token/getCustomTokens', undefined, securityToken);

export const addNotification = (
	payload: IAddNotificationRequest,
	securityToken: string
): Promise<IAddNotificationResponse> => signedPost('/api/notification/addNotification', payload, securityToken);

export const markNotificationRead = (payload: IMarkNotificationReadRequest, securityToken: string): Promise<void> =>
	signedPost('/api/notification/markNotificationRead', payload, securityToken);

export const markAllNotificationsRead = (securityToken: string): Promise<void> =>
	signedPost('/api/notification/markAllNotificationsRead', undefined, securityToken);

export const deleteNotifications = (payload: IDeleteNotificationsRequest, securityToken: string): Promise<void> =>
	signedPost('/api/notification/deleteNotifications', payload, securityToken);

export const getNotifications = (securityToken: string): Promise<IGetNotificationsResponse> =>
	signedPost('/api/notification/getNotifications', undefined, securityToken);

export const addWatchedToken = (payload: IAddWatchedTokenRequest, securityToken: string) =>
	signedPost('/api/token/addWatchedToken', payload, securityToken);

export const deleteWatchedToken = (payload: IDeleteWatchedTokenRequest, securityToken: string) =>
	signedPost('/api/token/deleteWatchedToken', payload, securityToken);

export const getWatchedTokens = (securityToken: string) =>
	signedPost<IGetWatchedTokensResponse>('/api/token/getWatchedTokens', undefined, securityToken);
