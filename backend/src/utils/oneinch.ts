import axios from 'axios';
import { URL } from 'url';
import { retry } from 'utils/base';

interface IOneInchToken {
	symbol: string;
	name: string;
	address: string;
	decimals: bigint;
	logoUri: string;
}

export const getTokens = async (chainId: bigint): Promise<Array<IOneInchToken>> => {
	const oneInchUrl = new URL('https://api.1inch.exchange');
	oneInchUrl.pathname = `/v4.0/${BigInt(chainId)}/tokens/`;
	const response = await retry(() => axios.get(oneInchUrl.toString()));
	const tokens = new Array<IOneInchToken>();
	for (const [, { symbol, name, address, decimals, logoURI }] of Object.entries<{
		symbol: string;
		name: string;
		address: string;
		decimals: number;
		logoURI: string;
	}>(response.data.tokens)) {
		tokens.push({
			symbol,
			name,
			address,
			decimals: BigInt(decimals),
			logoUri: logoURI,
		});
	}
	return tokens;
};

export const getSpender = async (chainId: bigint): Promise<string> => {
	const oneInchUrl = new URL('https://api.1inch.exchange');
	oneInchUrl.pathname = `/v4.0/${BigInt(chainId)}/spender/`;
	const response = await retry(() => axios.get<{ address: string }>(oneInchUrl.toString()));
	return response.data.address;
};
