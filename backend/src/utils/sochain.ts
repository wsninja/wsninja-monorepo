import axios from 'axios';
import { URL } from 'url';
import { retry } from 'utils/base';

interface IUnspentOutput {
	status: string; // 'success'
	data: {
		network: string; // 'BTCTEST'
		address: string;
		txs: Array<{
			txid: string;
			output_no: number;
			script_asm: string;
			script_hex: string;
			value: string;
			confirmations: number;
			time: number;
		}>;
	};
}

export const getUnspentOutputs = async (address: string) => {
	const url = new URL('https://sochain.com');
	url.pathname = `/api/v2/get_tx_unspent/BTCTEST/${address}`;
	const response = await retry(() => axios.get<IUnspentOutput>(url.toString()));
	return response.data;
};

interface ISendTransaction {
	status: string; // 'success'
	data: {
		network: string; // 'BTCTEST'
		txid: string;
	};
}

export const sendTransaction = async (transaction: string) => {
	const url = new URL('https://sochain.com');
	url.pathname = `/api/v2/send_tx/BTCTEST`;
	const response = await retry(() => axios.post<ISendTransaction>(url.toString(), { tx_hex: transaction }));
	return response.data;
};
