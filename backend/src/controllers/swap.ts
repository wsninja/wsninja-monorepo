import axios from 'axios';
import { getCachedSwapTokens } from 'cache/swap';
import { REFERRER_ADDRESS, REFERRER_FEE } from 'constants/env';
import { Request, Response } from 'express';
import { ITransactionData } from 'types';
import { URL } from 'url';
import { retry, toHex } from 'utils/base';
import { ethereum } from 'utils/ethereum';

// "gasPrice" and "gas" must be removed. They will be calculated by ethers. "value" might not be a hex value with 0x prefix
const fixTransactionData = async (
	chainId: bigint,
	transactionData: {
		data: string;
		gasPrice: string;
		to: string;
		value: string;
		gas?: number;
	},
	from: string,
	nonce: number
): Promise<ITransactionData> => {
	const { to, value, data, gasPrice } = transactionData;
	let { gas } = transactionData;
	const fixedData = {
		from,
		to,
		value: toHex(value),
		data,
		gasPrice: toHex(gasPrice),
		nonce,
	};
	if (gas === undefined) {
		gas = Number(await retry(() => ethereum(chainId).estimateGas(fixedData)));
	}
	return { ...fixedData, gas: toHex(gas), gasLimit: toHex(gas), nonce };
};

const getAllowance = async (chainId: bigint, tokenAddress: string, walletAddress: string): Promise<bigint> => {
	const url = new URL('https://api.1inch.io');
	url.pathname = `/v4.0/${chainId}/approve/allowance/`;
	url.searchParams.append('tokenAddress', tokenAddress);
	url.searchParams.append('walletAddress', walletAddress);
	const response = await retry(() => axios.get(url.toString()));
	return BigInt(response.data.allowance);
};

const getAllowanceTransactionData = async (
	chainId: bigint,
	publicKey: string,
	tokenAddress: string,
	amount: bigint
): Promise<ITransactionData> => {
	const url = new URL('https://api.1inch.io');
	url.pathname = `/v4.0/${chainId}/approve/transaction/`;
	url.searchParams.append('tokenAddress', tokenAddress);
	url.searchParams.append('amount', amount.toString());
	const response = await retry(() =>
		axios.get<{ data: string; gasPrice: string; to: string; value: string }>(url.toString())
	);
	const nonce = Number(await retry(() => ethereum(chainId).getTransactionCount(publicKey, 'pending')));
	return fixTransactionData(chainId, response.data, publicKey, nonce);
};

const getSwapTransactionData = async (
	chainId: bigint,
	fromTokenAddress: string,
	toTokenAddress: string,
	amount: bigint,
	fromAddress: string,
	slippage: number,
	allowPartialFill: boolean
): Promise<ITransactionData> => {
	const url = new URL('https://api.1inch.io');
	url.pathname = `/v4.0/${chainId}/swap/`;
	url.searchParams.append('fromTokenAddress', fromTokenAddress);
	url.searchParams.append('toTokenAddress', toTokenAddress);
	url.searchParams.append('amount', amount.toString());
	url.searchParams.append('fromAddress', fromAddress);
	url.searchParams.append('slippage', slippage.toString());
	url.searchParams.append('allowPartialFill', allowPartialFill ? 'true' : 'false');
	url.searchParams.append('referrerAddress', REFERRER_ADDRESS);
	url.searchParams.append('fee', REFERRER_FEE.toString());
	const response = await retry(() => axios.get(url.toString()));
	const nonce = Number(await retry(() => ethereum(chainId).getTransactionCount(fromAddress, 'pending')));
	return fixTransactionData(chainId, response.data.tx, fromAddress, nonce);
};

interface IGetTokensResponse {
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

export const getTokens = async (req: Request, res: Response<IGetTokensResponse>) => {
	const tokens = getCachedSwapTokens().map((token) => ({
		...token,
		chainId: token.chainId.toString(),
		decimals: token.decimals.toString(),
	}));
	res.json({ data: tokens });
};

interface IGetAllowanceTransactionRequest {
	publicKey: string;
	chainId: string;
	fromTokenAddress: string;
	amount: string;
}

interface IGetAllowanceTransactionResponse {
	data?: ITransactionData;
}

export const getAllowanceTransaction = async (
	req: Request<{}, {}, IGetAllowanceTransactionRequest>,
	res: Response<IGetAllowanceTransactionResponse>
) => {
	const { publicKey, chainId, fromTokenAddress, amount } = req.body;
	const allowance = await getAllowance(BigInt(chainId), fromTokenAddress, publicKey);
	if (allowance < BigInt(amount)) {
		const allowanceTransactionData = await getAllowanceTransactionData(
			BigInt(chainId),
			publicKey,
			fromTokenAddress,
			BigInt(amount)
		);
		return res.json({ data: allowanceTransactionData });
	}
	return res.json({});
};

interface IGetSwapTransactionRequest {
	publicKey: string;
	chainId: string;
	fromTokenAddress: string;
	toTokenAddress: string;
	amount: string;
	allowPartialFill: boolean;
	slippage: number;
}

interface IGetSwapTransactionResponse {
	data?: ITransactionData;
}

export const getSwapTransaction = async (
	req: Request<{}, {}, IGetSwapTransactionRequest>,
	res: Response<IGetSwapTransactionResponse>
) => {
	const { publicKey, chainId, fromTokenAddress, toTokenAddress, amount, allowPartialFill, slippage } = req.body;
	const swapTransactionData = await getSwapTransactionData(
		BigInt(chainId),
		fromTokenAddress,
		toTokenAddress,
		BigInt(amount),
		publicKey,
		slippage,
		allowPartialFill
	);
	res.json({ data: swapTransactionData });
};

interface IGetReferrerFeeResponse {
	data: number;
}

export const getReferrerFee = async (req: Request, res: Response<IGetReferrerFeeResponse>) => {
	res.json({ data: REFERRER_FEE });
};
