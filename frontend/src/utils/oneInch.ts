import axios from 'axios';

interface ISwapQuote {
	fromToken: {
		symbol: string;
		name: string;
		address: string;
		decimals: number;
		logoURI: string;
	};
	toToken: {
		symbol: string;
		name: string;
		address: string;
		decimals: number;
		logoURI: string;
	};
	toTokenAmount: string;
	fromTokenAmount: string;
	protocols: [
		{
			name: string;
			part: number;
			fromTokenAddress: string;
			toTokenAddress: string;
		}
	];
	estimatedGas: number;
}

export const getSwapQuote = (
	chainId: bigint,
	srcTokenAddress: string,
	destTokenAddress: string,
	amount: bigint,
	referrerFee: number
): Promise<ISwapQuote> => {
	const params = new URLSearchParams();
	params.append('fromTokenAddress', srcTokenAddress);
	params.append('toTokenAddress', destTokenAddress);
	params.append('amount', amount.toString());
	params.append('fee', referrerFee.toString());
	return axios
		.get<ISwapQuote>(`https://api.1inch.exchange/v4.0/${chainId}/quote/?${params.toString()}`)
		.then((response) => response.data);
};
