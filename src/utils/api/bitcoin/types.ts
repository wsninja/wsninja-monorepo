export interface IGetUnspentOutputsRequest {
	address: string;
}

export interface IGetUnspentOutputsResponse {
	unspentTransactions: Array<{
		transactionId: string;
		outputIndex: number;
		amount: bigint;
		script: string;
	}>;
}

export interface ISendTransactionRequest {
	signedTransaction: string;
}

export interface ISendTransactionResponse {
	transactionId: string;
}
