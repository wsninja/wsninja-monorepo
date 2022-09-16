import Common, { Chain, CustomChain } from '@ethereumjs/common';
import { Transaction, TxData } from '@ethereumjs/tx';
import { addHexPrefix, toBuffer } from 'ethereumjs-util';
import { store } from 'store/store';
import { updateNonce } from 'store/user/actions';
import { IChain } from 'types';
import {
	estimateGas,
	getGasPrice,
	getNonce as api_getNonce,
	sendTransaction as api_sendTransaction,
} from 'utils/api/api';
import { getChainId, toHex } from 'utils/utils';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

const getNonce = (chain: IChain): bigint => {
	const { nonces } = store.getState().user;
	const nonce = nonces.find((nonce) => nonce.chain === chain);
	if (nonce) {
		return nonce.nonce;
	}
	return 0n;
};

const setNonce = (chain: IChain, nonce: bigint) => {
	const oldNonce = getNonce(chain);
	if (oldNonce < nonce) {
		store.dispatch(updateNonce(chain, nonce));
	}
};

export const getCommon = (chain: IChain): Common => {
	const chainId = getChainId(chain);
	switch (chain) {
		case 'bsc':
			return Common.custom({ chainId: Number(chainId) });
		case 'ethereum':
			return new Common({ chain: Chain.Mainnet });
		case 'polygon':
			return Common.custom(CustomChain.PolygonMainnet);
		default:
			throw new Error('Not a ethereum based chain');
	}
};

export const prepareBaseTransaction = async (
	chain: IChain,
	baseTransactionData: {
		from: string;
		to: string;
		value?: string | number | bigint;
		data?: string;
	},
	securityToken: string
) => {
	const { from, to, value, data } = baseTransactionData;
	const chainId = getChainId(chain);
	const gasPrice = await getGasPrice(chainId);
	const { nonce: rpcNonce } = await api_getNonce({ chainId }, securityToken);
	const localNonce = getNonce(chain);
	const nonce = rpcNonce > localNonce ? rpcNonce : localNonce;
	const transactionConfig: TransactionConfig = {
		from: addHexPrefix(from),
		to: addHexPrefix(to),
		value: value === undefined ? undefined : toHex(value),
		data: data === undefined ? undefined : addHexPrefix(data),
		gasPrice: toHex(gasPrice),
		nonce: Number(nonce),
	};
	const { gas } = await estimateGas({ chainId, transactionData: transactionConfig }, securityToken);
	transactionConfig.gas = toHex(gas);
	const transactionData: TxData = {
		to: addHexPrefix(to),
		gasPrice: toHex(gasPrice),
		gasLimit: toHex(gas),
		nonce: toHex(nonce),
		value: value === undefined ? undefined : toHex(value),
		data: data === undefined ? undefined : addHexPrefix(data),
	};
	return transactionData;
};

export const sendPreparedTransaction = async (
	chain: IChain,
	preparedTransaction: TxData,
	securityToken: string,
	privateKey: string
) => {
	const chainId = getChainId(chain);
	const common = getCommon(chain);
	const transaction = Transaction.fromTxData(preparedTransaction, { common });
	const signedTransaction = transaction.sign(toBuffer(addHexPrefix(privateKey)));
	const serialisedTransaction = addHexPrefix(signedTransaction.serialize().toString('hex'));
	const { transactionReceipt } = await api_sendTransaction(
		{ chainId, signedTransaction: serialisedTransaction },
		securityToken
	);
	if (
		preparedTransaction.nonce &&
		(typeof preparedTransaction.nonce === 'number' || typeof preparedTransaction.nonce === 'string')
	) {
		setNonce(chain, BigInt(preparedTransaction.nonce));
	}
	return transactionReceipt;
};

export const sendBaseTransaction = async (
	chain: IChain,
	baseTransactionData: {
		from: string;
		to: string;
		value?: string | number | bigint;
		data?: string;
	},
	securityToken: string,
	privateKey: string
): Promise<TransactionReceipt> => {
	const { from, to, value, data } = baseTransactionData;
	const chainId = getChainId(chain);
	const gasPrice = await getGasPrice(chainId);
	const { nonce: rpcNonce } = await api_getNonce({ chainId }, securityToken);
	const localNonce = getNonce(chain);
	const nonce = rpcNonce > localNonce ? rpcNonce : localNonce;
	const transactionConfig: TransactionConfig = {
		from: addHexPrefix(from),
		to: addHexPrefix(to),
		value: value === undefined ? undefined : toHex(value),
		data: data === undefined ? undefined : addHexPrefix(data),
		gasPrice: toHex(gasPrice),
		nonce: Number(nonce),
	};
	const { gas } = await estimateGas({ chainId, transactionData: transactionConfig }, securityToken);
	transactionConfig.gas = toHex(gas);
	const transactionData: TxData = {
		to: addHexPrefix(to),
		value: value === undefined ? undefined : toHex(value),
		data: data === undefined ? undefined : addHexPrefix(data),
		gasPrice: toHex(gasPrice),
		gasLimit: toHex(gas),
		nonce: toHex(nonce),
	};
	const common = getCommon(chain);
	const transaction = Transaction.fromTxData(transactionData, { common });
	const signedTransaction = transaction.sign(toBuffer(addHexPrefix(privateKey)));
	const serialisedTransaction = addHexPrefix(signedTransaction.serialize().toString('hex'));
	const { transactionReceipt } = await api_sendTransaction(
		{ chainId, signedTransaction: serialisedTransaction },
		securityToken
	);
	setNonce(chain, nonce);
	return transactionReceipt;
};

export const sendTransaction = async (
	chain: IChain,
	transactionData: TxData,
	securityToken: string,
	privateKey: string
): Promise<TransactionReceipt> => {
	const chainId = getChainId(chain);
	const common = getCommon(chain);
	const transaction = Transaction.fromTxData(transactionData, { common });
	const signedTransaction = transaction.sign(toBuffer(addHexPrefix(privateKey)));
	const serialisedTransaction = addHexPrefix(signedTransaction.serialize().toString('hex'));
	const { transactionReceipt } = await api_sendTransaction(
		{ chainId, signedTransaction: serialisedTransaction },
		securityToken
	);
	const { nonce } = transactionData;
	if (typeof nonce === 'string' || typeof nonce === 'number') {
		setNonce(chain, BigInt(nonce));
	}
	return transactionReceipt;
};
