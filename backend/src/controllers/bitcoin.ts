import BigNumber from 'bignumber.js';
import { Request, Response } from 'express';
import {
	getUnspentOutputs as sochain_getUnspentOutputs,
	sendTransaction as sochain_sendTransaction,
} from 'utils/sochain';
import { bigNumberToBigint, parseSignedRequest, sendResponse } from 'utils/utils';

interface IGetUnspentOutputsRequest {
	address: string;
}

interface IGetUnspentOutputsResponse {
	unspentTransactions: Array<{
		transactionId: string;
		outputIndex: number;
		amount: bigint;
		script: string;
	}>;
}

export const getUnspentOutputs = async (req: Request, res: Response) => {
	const {
		payload: { address },
	} = parseSignedRequest<IGetUnspentOutputsRequest>(req);
	const unspentOutputs = await sochain_getUnspentOutputs(address);
	const unspentTransactions = unspentOutputs.data.txs.map<IGetUnspentOutputsResponse['unspentTransactions'][0]>(
		({ txid, output_no, value, script_hex }) => ({
			transactionId: txid,
			outputIndex: output_no,
			amount: bigNumberToBigint(new BigNumber(value), 8n),
			script: script_hex,
		})
	);
	return sendResponse<IGetUnspentOutputsResponse>(res, { unspentTransactions });
};

interface ISendTransactionRequest {
	signedTransaction: string;
}

interface ISendTransactionResponse {
	transactionId: string;
}

export const sendTransaction = async (req: Request, res: Response) => {
	const {
		payload: { signedTransaction },
	} = parseSignedRequest<ISendTransactionRequest>(req);
	const {
		data: { txid },
	} = await sochain_sendTransaction(signedTransaction);
	return sendResponse<ISendTransactionResponse>(res, { transactionId: txid });
};
