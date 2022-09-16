export type IChain = 'bitcoin' | 'bsc' | 'ethereum' | 'polygon';

export interface ITransactionData {
	from: string;
	to: string;
	value: string;
	data?: string;
	gas: string;
	gasPrice: string;
	gasLimit: string;
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
}

export interface IBaseRequest<T> {
	payload: T;
}

export interface ISignedRequest<T> extends IBaseRequest<T> {
	securityToken: string;
}

export interface IExtSignedRequest<T> extends ISignedRequest<T> {
	publicKey: string;
	address: string;
}

export interface ISecurityToken {
	publicKey: string;
	address: string;
	createdAt: Date;
}

export interface IChainInfo {
	chain: IChain;
	chainId?: bigint;
	name: string;
	symbol: string;
	logoUri: string;
	oneInchRouterAddresses: Array<string>;
	coinGeckoId: string;
}

export interface IStringIndexed<T> {
	[key: string]: T;
}

export interface INetwork {
	chain: IChain;
	chainId?: bigint;
}
