import { getCachedTokens } from 'cache/tokens';
import {
	addCustomToken as db_addCustomToken,
	addHiddenToken as db_addHiddenToken,
	addWatchedToken as db_addWatchedToken,
	deleteHiddenToken as db_deleteHiddenToken,
	deleteWatchedToken as db_deleteWatchedToken,
	getCustomTokens as db_getCustomTokens,
	getHiddenTokens as db_getHiddenTokens,
	getWatchedTokens as db_getWatchedTokens,
} from 'db/token';
import { getUserIdOrThrow } from 'db/user';
import { addHexPrefix } from 'ethereumjs-util';
import { Request, Response } from 'express';
import { retry } from 'utils/base';
import { erc20, ethereum } from 'utils/ethereum';
import { HttpError } from 'utils/httpError';
import { parseSignedRequest, sendResponse } from 'utils/utils';

interface IGetTokenPriceRequest {
	tokenSymbol: string;
}

interface IGetTokenPriceResponse {
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

export const getTokenPrice = async (req: Request, res: Response) => {
	const {
		payload: { tokenSymbol },
	} = parseSignedRequest<IGetTokenPriceRequest>(req);
	const tokens = await getCachedTokens();
	const token = tokens.find((token) => token.symbol.toLowerCase() === tokenSymbol.toLowerCase());
	if (token) {
		const { symbol, price_change_24h, price_change_percentage_24h, current_price, image, low_24h, high_24h } = token;
		return sendResponse<IGetTokenPriceResponse>(res, {
			tokenPrice: {
				symbol,
				price: current_price,
				priceChange24h: price_change_24h,
				priceChangePercentage24h: price_change_percentage_24h,
				priceLow24h: low_24h,
				priceHigh24h: high_24h,
				logoUri: image,
			},
		});
	}
	return sendResponse<IGetTokenPriceResponse>(res, {});
};

interface IAddCustomTokenRequest {
	chainId: bigint;
	address: string;
}

export const addCustomToken = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { chainId, address },
	} = parseSignedRequest<IAddCustomTokenRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	if ((await retry(() => ethereum(chainId).getCode(address))) === '0x') {
		throw new HttpError(400, 'Address is not for a contract!');
	}
	const name = await retry<string>(erc20(chainId, addHexPrefix(address)).call.name);
	const symbol = await retry<string>(erc20(chainId, addHexPrefix(address)).call.symbol);
	await db_addCustomToken(userId, chainId, address, name, symbol, '');
	return sendResponse(res, undefined);
};

interface IGetCustomTokensResponse {
	customTokens: Array<{
		chainId: bigint;
		address: string;
		name: string;
		symbol: string;
		logoUri: string;
	}>;
}

export const getCustomTokens = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userId = await getUserIdOrThrow(publicKey);
	const customTokens = await db_getCustomTokens(userId);
	return sendResponse<IGetCustomTokensResponse>(res, { customTokens });
};

interface IAddWatchedTokenRequest {
	tokenSymbol: string;
}

export const addWatchedToken = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { tokenSymbol },
	} = parseSignedRequest<IAddWatchedTokenRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	await db_addWatchedToken(userId, tokenSymbol);
	return sendResponse(res, undefined);
};

interface IDeleteWatchedTokenRequest {
	tokenSymbol: string;
}

export const deleteWatchedToken = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { tokenSymbol },
	} = parseSignedRequest<IDeleteWatchedTokenRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	await db_deleteWatchedToken(userId, tokenSymbol);
	return sendResponse(res, undefined);
};

interface IGetWatchedTokensResponse {
	watchedTokens: Array<{ symbol: string }>;
}

export const getWatchedTokens = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userId = await getUserIdOrThrow(publicKey);
	const watchedTokens = await db_getWatchedTokens(userId);
	return sendResponse<IGetWatchedTokensResponse>(res, { watchedTokens });
};

interface IAddHiddenTokenRequest {
	chainId: bigint;
	address: string;
}

interface IAddHiddenTokenResponse {
	hiddenTokenId: bigint;
}

export const addHiddenToken = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { chainId, address },
	} = parseSignedRequest<IAddHiddenTokenRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	const hiddenTokenId = await db_addHiddenToken(userId, chainId, address);
	return sendResponse<IAddHiddenTokenResponse>(res, { hiddenTokenId });
};

interface IGetHiddenTokensResponse {
	hiddenTokens: Array<{ chainId: bigint; address: string }>;
}

export const getHiddenTokens = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userId = await getUserIdOrThrow(publicKey);
	const hiddenTokens = await db_getHiddenTokens(userId);
	return sendResponse<IGetHiddenTokensResponse>(res, { hiddenTokens });
};

interface IDeleteHiddenTokenRequest {
	chainId: bigint;
	address: string;
}

export const deleteHiddenToken = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { chainId, address },
	} = parseSignedRequest<IDeleteHiddenTokenRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	await db_deleteHiddenToken(userId, chainId, address);
	return sendResponse(res, undefined);
};
