export interface IAddHiddenTokenRequest {
	chainId: bigint;
	address: string;
}

export interface IAddHiddenTokenResponse {
	hiddenTokenId: bigint;
}

export interface IGetHiddenTokensResponse {
	hiddenTokens: Array<{ chainId: bigint; address: string }>;
}

export interface IDeleteHiddenTokenRequest {
	chainId: bigint;
	address: string;
}
