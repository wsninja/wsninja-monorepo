import { PrivateKey, Transaction } from 'bitcore-lib';
import { getUnspentOutputs, sendTransaction as blockcypher_sendTransaction } from 'utils/blockcypher';

export const calcFee = (inputCount: bigint, feePerByte: bigint): bigint => {
	const transactionSize = inputCount * 180n + 2n * 34n + 10n - inputCount;
	return transactionSize * feePerByte;
};

export const sendTransaction = async (
	srcAddress: string,
	destAddress: string,
	amount: bigint,
	securityToken: string,
	privateKey: string
): Promise<string> => {
	const unspentTransactions = await getUnspentOutputs(srcAddress);
	const feePerByte = 20n;
	let totalUnspentAmount = 0n;
	let inputCount = 0n;
	const unspentOutputs = new Array<Transaction.UnspentOutput>();
	for (const { transactionHash, outputIndex, script, value: unspentAmount } of unspentTransactions) {
		if (amount > totalUnspentAmount - calcFee(inputCount, feePerByte)) {
			unspentOutputs.push(
				new Transaction.UnspentOutput({
					address: srcAddress,
					txid: transactionHash,
					outputIndex: Number(outputIndex),
					script,
					satoshis: Number(unspentAmount),
				})
			);
			totalUnspentAmount += unspentAmount;
			inputCount += 1n;
		}
	}
	const transaction = new Transaction()
		.from(unspentOutputs) // Feed information about what unspent outputs one can use
		.to(destAddress, Number(amount)) // Add an output with the given amount of satoshis
		.change(srcAddress) // Sets up a change address where the rest of the funds will go
		.fee(Number(calcFee(inputCount, feePerByte)))
		.sign(new PrivateKey(privateKey)); // Signs all the inputs it can
	const serilisedTransaction = transaction.serialize();
	const transactionHash = await blockcypher_sendTransaction(serilisedTransaction);
	return transactionHash;
};
