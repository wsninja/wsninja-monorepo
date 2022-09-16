import erc20Abi from 'abi/erc20.json';
import {
	BSC_RPC_URL_1,
	BSC_RPC_URL_2,
	ETHEREUM_RPC_URL_1,
	ETHEREUM_RPC_URL_2,
	POLYGON_RPC_URL_1,
	POLYGON_RPC_URL_2,
} from 'constants/env';
import { addHexPrefix } from 'ethereumjs-util';
import { errorToString, logError } from 'utils/base';
import Web3 from 'web3';
import { BlockNumber, TransactionConfig } from 'web3-core';
import { AbiItem } from 'web3-utils/types';

const getRpcUrls = (chainId: bigint): Array<string> => {
	switch (chainId) {
		case 1n:
			return [ETHEREUM_RPC_URL_1, ETHEREUM_RPC_URL_2];
		case 56n:
			return [BSC_RPC_URL_1, BSC_RPC_URL_2];
		case 137n:
			return [POLYGON_RPC_URL_1, POLYGON_RPC_URL_2];
		default:
			throw new Error('Unknown chain id');
	}
};

const isInalidJsonRpcResponse = (error: unknown): boolean =>
	errorToString(error).toLowerCase().includes('invalid json rpc response');

const call = async <T>(chainId: bigint, fn: (web3: Web3) => T) => {
	const rpcUrls = getRpcUrls(chainId);
	for (let i = 0; rpcUrls.length > i; i++) {
		try {
			const web3 = new Web3(rpcUrls[i]);
			return await fn(web3); // await is required for the catch
		} catch (e) {
			if (!isInalidJsonRpcResponse(e)) {
				throw e;
			}
			logError(`Invalid JSON RPC response from rpc: "${rpcUrls[i]}"`);
		}
	}
	throw new Error(`No response from any rpc server for chain ${chainId}`);
};

export const ethereum = (chainId: bigint) => ({
	estimateGas: async (transactionConfig: TransactionConfig): Promise<bigint> =>
		call(chainId, async (web3) => {
			return BigInt(await web3.eth.estimateGas(transactionConfig));
		}),
	getCode: (address: string) => call(chainId, (web3) => web3.eth.getCode(addHexPrefix(address))),
	getGasPrice: async (): Promise<bigint> => call(chainId, async (web3) => BigInt(await web3.eth.getGasPrice())),
	getTransaction: (transactionHash: string) =>
		call(chainId, (web3) => web3.eth.getTransaction(addHexPrefix(transactionHash))),
	getTransactionCount: async (address: string, defaultBlock?: BlockNumber): Promise<bigint> =>
		call(chainId, async (web3) => {
			if (defaultBlock === undefined) {
				return BigInt(await web3.eth.getTransactionCount(addHexPrefix(address)));
			}
			return BigInt(await web3.eth.getTransactionCount(addHexPrefix(address), defaultBlock));
		}),
	sendSignedTransaction: (signedTransactionData: string) =>
		call(chainId, (web3) => web3.eth.sendSignedTransaction(addHexPrefix(signedTransactionData))),
});

export const erc20 = (chainId: bigint, contractAddress: string) => ({
	call: {
		decimals: async (): Promise<bigint> =>
			call(chainId, async (web3) => {
				const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>, addHexPrefix(contractAddress));
				return BigInt(await erc20.methods.decimals().call());
			}),
		name: async (): Promise<string> =>
			call(chainId, async (web3) => {
				const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>, addHexPrefix(contractAddress));
				return erc20.methods.name().call();
			}),
		symbol: async (): Promise<string> =>
			call(chainId, async (web3) => {
				const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>, addHexPrefix(contractAddress));
				return erc20.methods.symbol().call();
			}),
	},
});
