import axios from 'axios';
import { TESTING } from 'constants/env';
import { ITransaction } from 'types';
import { retry, sleep } from 'utils/utils';

const getBitcoinChainName = () => (TESTING ? 'test3' : 'main');

interface IBlockcypherAddrsFullResponse {
	address: string;
	balance: number;
	final_balance: number;
	final_n_tx: number;
	n_tx: number;
	total_received: number;
	total_sent: number;
	unconfirmed_balance: number;
	unconfirmed_n_tx: number;
	txs: Array<{
		addresses: Array<string>;
		block_hash: string;
		block_height: number;
		block_index: number;
		confidence: number;
		confirmations: number;
		confirmed: string; // ISO date
		double_spend: boolean;
		fees: number;
		hash: string;
		preference: string; // 'low'
		received: string; // ISO date
		size: number;
		total: number;
		ver: number;
		von_sz: number;
		vout_sz: number;
		vsize: number;
		inputs: Array<{
			addresses: Array<string>;
			age: number;
			output_index: number;
			output_value: number;
			prev_hash: string;
			script: string;
			script_type: string; // 'pay-to-pubkey-hash'
			sequence: number;
		}>;
		outputs: Array<{
			addresses: Array<string>;
			script: string;
			script_type: string; // 'pay-to-pubkey-hash'
			value: number;
		}>;
	}>;
}

export const getTransactions = async (address: string): Promise<Array<ITransaction>> => {
	const url = new URL('https://api.blockcypher.com');
	url.pathname = `/v1/btc/${getBitcoinChainName()}/addrs/${address}/full`;
	url.searchParams.append('limit', '50');
	let rawTransactions = new Array<IBlockcypherAddrsFullResponse['txs'][0]>();
	const { data } = await retry(() => axios.get<IBlockcypherAddrsFullResponse>(url.toString()));
	const totalTransactionCount = data.n_tx;
	rawTransactions = rawTransactions.concat(data.txs);
	while (rawTransactions.length < totalTransactionCount) {
		await sleep(333);
		const before = rawTransactions[rawTransactions.length - 1].block_height;
		const url = new URL('https://api.blockcypher.com');
		url.pathname = `/v1/btc/${getBitcoinChainName()}/addrs/${address}/full`;
		url.searchParams.append('limit', '50');
		url.searchParams.append('before', before.toString());
		const { data } = await retry(() => axios.get<IBlockcypherAddrsFullResponse>(url.toString()));
		rawTransactions = rawTransactions.concat(data.txs);
	}
	return rawTransactions.map((transaction) => {
		let fromAddress = address;
		let toAddress = address;
		if (transaction.inputs.find(({ addresses }) => addresses.find((a) => a === address) === address)) {
			const output = transaction.outputs.find(({ addresses }) => addresses.find((a) => a !== address) !== address);
			if (output) {
				const tmpToAddress = output.addresses.find((a) => a !== address);
				if (tmpToAddress) {
					toAddress = tmpToAddress;
				}
			}
		} else {
			const input = transaction.inputs.find(({ addresses }) => addresses[0] !== address);
			if (input) {
				const tmpFromAddress = input.addresses.find((a) => a !== address);
				if (tmpFromAddress) {
					fromAddress = tmpFromAddress;
				}
			}
		}
		return {
			chain: 'bitcoin',
			transactionHash: transaction.hash,
			type: fromAddress === address ? 'sent' : 'received',
			date: new Date(transaction.confirmed),
			successful: true,
			fromAddress,
			toAddress,
			value: BigInt(transaction.total),
			valueUnit: 'BTC',
			usedGas: BigInt(transaction.fees),
			decimals: 8n,
		};
	});
};

interface IBlockcypherAddrsBalanceResponse {
	address: string;
	balance: number;
	final_balance: number;
	final_n_tx: number;
	n_tx: number;
	total_received: number;
	total_sent: number;
	unconfirmed_balance: number;
	unconfirmed_n_tx: number;
}

export const getBalance = async (address: string): Promise<bigint> => {
	const url = new URL('https://api.blockcypher.com');
	url.pathname = `/v1/btc/${getBitcoinChainName()}/addrs/${address}/balance`;
	const { data } = await axios.get<IBlockcypherAddrsBalanceResponse>(url.toString());
	return BigInt(data.balance);
};

interface IBlockcypherAddrsResponse {
	address: string;
	balance: number;
	final_balance: number;
	final_n_tx: number;
	n_tx: number;
	total_received: number;
	total_sent: number;
	tx_url: string;
	unconfirmed_balance: number;
	unconfirmed_n_tx: number;
	txrefs: Array<{
		block_height: number;
		confirmations: number;
		confirmed: string; // ISO date
		double_spend: boolean;
		ref_balance: number;
		script: string;
		spent: boolean;
		tx_hash: string;
		tx_input_n: number;
		tx_output_n: number;
		value: number;
	}>;
}

export const getUnspentOutputs = async (
	address: string
): Promise<Array<{ outputIndex: bigint; transactionHash: string; script: string; value: bigint }>> => {
	const url = new URL('https://api.blockcypher.com');
	url.pathname = `/v1/btc/${getBitcoinChainName()}/addrs/${address}`;
	url.searchParams.append('unspentOnly', 'true');
	url.searchParams.append('includeScript', 'true');
	const { data } = await axios.get<IBlockcypherAddrsResponse>(url.toString());
	const unspentOutputs = data.txrefs.map(({ tx_hash, tx_output_n, script, value }) => ({
		outputIndex: BigInt(tx_output_n),
		transactionHash: tx_hash,
		value: BigInt(value),
		script,
	}));
	unspentOutputs.sort((a, b) => Number(a.value - b.value));
	return unspentOutputs;
};

interface IBlockcypherTxsPushResponse {
	tx: {
		addresses: Array<string>;
		block_height: number; // -1
		block_index: number; // -1
		confirmations: number;
		double_spend: boolean;
		fees: number;
		hash: string;
		preference: string; // 'low'
		received: string; // ISO date
		size: number;
		total: number;
		ver: number;
		vin_sz: number;
		vout_sz: number;
		vsize: number;
		inputs: Array<{
			addresses: Array<string>;
			age: number;
			output_index: number;
			output_value: number;
			prev_hash: string;
			script: string;
			script_type: string; // 'pay-to-pubkey-hash'
			sequence: number;
		}>;
		outputs: Array<{
			addresses: Array<string>;
			script: string;
			script_type: string; // 'pay-to-pubkey-hash'
			value: number;
		}>;
	};
}

export const sendTransaction = async (signedTransaction: string): Promise<string> => {
	const url = new URL('https://api.blockcypher.com');
	url.pathname = `/v1/btc/${getBitcoinChainName()}/txs/push`;
	const { data } = await axios.post<IBlockcypherTxsPushResponse>(url.toString(), { tx: signedTransaction });
	return data.tx.hash;
};
