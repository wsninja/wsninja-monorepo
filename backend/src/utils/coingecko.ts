import axios from 'axios';
import moment from 'moment';
import { URL } from 'url';
import { retry, sleep } from 'utils/base';

export interface IMarketsToken {
	id: string;
	symbol: string;
	image: string;
	current_price?: number;
	market_cap: number;
	market_cap_rank: number;
	fully_diluted_valuation: number;
	total_volume: number;
	high_24h: number;
	low_24h: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	circulating_supply: number;
	total_supply: number;
	max_supply: number;
	ath: number;
	ath_change_percentage: number;
	ath_date: string;
	atl: number;
	atl_change_percentage: number;
	atl_date: string;
	roi: {
		times: number;
		currency: string;
		percentage: number;
	};
	last_updated: string;
}

const getMarketsPage = async (pageNumber: bigint): Promise<Array<IMarketsToken>> => {
	const url = new URL('https://api.coingecko.com');
	url.pathname = '/api/v3/coins/markets';
	url.searchParams.append('vs_currency', 'usd');
	url.searchParams.append('per_page', '250');
	url.searchParams.append('page', pageNumber.toString());
	const response = await retry(() => axios.get<Array<IMarketsToken>>(url.toString()));
	return response.data;
};

export const getMarkets = async (): Promise<Array<IMarketsToken>> => {
	let tokens = new Array<IMarketsToken>();
	let pageNumber = 1n;
	let newTokens: Array<IMarketsToken>;
	do {
		newTokens = await getMarketsPage(pageNumber);
		if (newTokens.length > 0) {
			tokens = tokens.concat(newTokens);
		}
		pageNumber += 1n;
		if (newTokens.length > 0) {
			await sleep(100);
		}
	} while (newTokens.length > 0);
	return tokens;
};

interface IToken {
	id: string;
	symbol: string;
	name: string;
	market_data: {
		current_price: {
			usd: number;
		};
	};
}

export const getToken = async (id: string): Promise<IToken> => {
	const url = new URL('https://api.coingecko.com');
	url.pathname = `/api/v3/coins/${id}`;
	url.searchParams.append('localization', 'false');
	url.searchParams.append('tickers', 'false');
	url.searchParams.append('market_data', 'true');
	url.searchParams.append('community_data', 'false');
	url.searchParams.append('developer_data', 'false');
	const response = await retry(() => axios.get<IToken>(url.toString()));
	return response.data;
};

interface IGetHistoryResponse {
	id: string;
	symbol: string;
	name: string;
	market_data: {
		current_price: {
			usd: number;
		};
		market_cap: { usd: number };
		total_value: {
			usd: number;
		};
	};
}

export const getHistory = async (id: string, date: Date): Promise<IGetHistoryResponse> => {
	const url = new URL('https://api.coingecko.com');
	url.pathname = `/api/v3/coins/${id}/history`;
	url.searchParams.append('date', moment(date).format('DD-MM-YYYY'));
	const response = await retry(() => axios.get<IGetHistoryResponse>(url.toString()));
	return response.data;
};
