import axios from 'axios';
import { COVALENT_API_KEY } from 'constants/env';
import { addHexPrefix } from 'ethereumjs-util';
import { URL } from 'url';
import { retry } from 'utils/base';

export interface ICovalenthqBalancesResponse {
	data: {
		address: string;
		updated_at: string; // ISO date
		next_update_at: string; // ISO date
		quote_currenty: string; // 'USD'
		chain_id: number;
		items: Array<{
			contract_decimals: number;
			contract_name: string;
			contract_ticker_symbol: string;
			contract_address: string;
			supports_erc: Array<'erc20'>;
			logo_url: string;
			last_transferred_at: string | null; // ISO date
			type: 'cryptocurrency';
			balance: string;
			balance_24h: string | null;
			quote_rate: number;
			quote_rate_24h: number;
			quote: number;
			quote_24h: null;
			nft_data: null;
		}>;
		pagination: null;
	};
	error: boolean;
	error_message: null;
	error_code: null;
}

export const getBalances = async (
	chainId: bigint,
	address: string
): Promise<ICovalenthqBalancesResponse['data']['items']> => {
	const balanceUrl = new URL('https://api.covalenthq.com');
	balanceUrl.pathname = `/v1/${BigInt(chainId)}/address/${addHexPrefix(address)}/balances_v2/`;
	balanceUrl.searchParams.append('key', COVALENT_API_KEY);
	balanceUrl.searchParams.append('nft', 'true');
	const response = await retry(() => axios.get<ICovalenthqBalancesResponse>(balanceUrl.toString()));
	return response.data.data.items;
};

interface ICovalenthqTransactionsResponse {
	data: {
		address: string;
		updated_at: string; // ISO date
		next_update_at: string; // ISO date
		quote_currency: string; // 'USD'
		chain_id: number;
		items: Array<{
			block_signed_at: string; // ISO date
			block_height: number;
			tx_hash: string;
			tx_offset: number;
			successful: boolean;
			from_address: string;
			from_address_label: null;
			to_address: string;
			to_address_label: null;
			value: string;
			value_quote: number;
			gas_offered: number;
			gas_spent: number;
			gas_price: number;
			fees_paid: number;
			gas_quote: number;
			gas_quote_rate: number;
			log_events: Array<{
				block_signed_at: string; // ISO date
				block_height: number;
				tx_offset: number;
				log_offset: number;
				tx_hash: string;
				raw_log_topics: Array<string>;
				sender_contract_decimals: number;
				sender_name: string;
				sender_contract_ticker_symbol: string;
				sender_address: string;
				sender_address_label: string;
				sender_logo_url: string;
				raw_log_data: string;
				decoded: null;
			}>;
		}>;
		pagination: {
			has_more: boolean;
			page_number: number; // Starts with 0
			page_size: number;
			total_count: null;
		};
	};
	error: boolean;
	error_message: null;
	error_code: null;
}

export const getTransactions = async (
	chainId: bigint,
	address: string
): Promise<ICovalenthqTransactionsResponse['data']['items']> => {
	const url = new URL('https://api.covalenthq.com');
	url.pathname = `/v1/${chainId}/address/${addHexPrefix(address)}/transactions_v2/`;
	url.searchParams.append('key', COVALENT_API_KEY);
	const items: ICovalenthqTransactionsResponse['data']['items'] = [];
	let pageNumber = 0n;
	while (true) {
		url.searchParams.append('page-number', pageNumber.toString());
		const response = await retry(() => axios.get<ICovalenthqTransactionsResponse>(url.toString()));
		for (const item of response.data.data.items) {
			if (!items.find(({ tx_hash }) => tx_hash === item.tx_hash)) {
				items.push(item);
			}
		}
		if (!response.data.data.pagination.has_more) {
			return items;
		}
		pageNumber += 1n;
	}
};
