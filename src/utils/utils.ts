import BigNumber from 'bignumber.js';
import { networks } from 'constants/networks';
import { defaultTokenFilters } from 'constants/swap';
import { detect } from 'detect-browser';
import { addHexPrefix } from 'ethereumjs-util';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { IChain, IToken, ITransaction } from 'types';

const hasOwnProperty = <X, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> =>
	Object.prototype.hasOwnProperty.call(obj, prop);

export const errorToString = (error: unknown): string => {
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error === 'number' || typeof error === 'bigint' || typeof error === 'boolean') {
		return error.toString();
	}
	if (typeof error === 'object' && error && error.toString() !== '[object Object]') {
		return error.toString();
	}
	if (typeof error === 'object' && error && hasOwnProperty(error, 'message') && typeof error.message === 'string') {
		return error.message;
	}
	if (typeof error === 'object') {
		return JSON.stringify(error);
	}
	return `${error}`;
};

export const getChainId = (chain: IChain): bigint => {
	const network = networks.find((network) => network.chain === chain);
	if (!network) {
		throw new Error('Cannot find network');
	}
	if (network.chainId === undefined) {
		throw new Error('Network is not ethereum based');
	}
	return network.chainId;
};

export const getChain = (chainId: bigint | number): IChain => {
	const network = networks.find((network) => network.chainId === BigInt(chainId));
	if (!network) {
		throw new Error('Cannot find network');
	}
	return network.chain;
};

export const getChainSymbol = (chainId: bigint | number): string => {
	const network = networks.find((network) => network.chainId === BigInt(chainId));
	if (!network) {
		throw new Error('Cannot find network');
	}
	return network.symbol;
};

export const mergeDeep = (obj1: unknown, obj2: unknown): unknown => {
	if (obj1 === undefined && obj2 === undefined) {
		return undefined;
	}
	if (
		obj2 !== undefined &&
		(obj2 === null ||
			typeof obj2 === 'string' ||
			typeof obj2 === 'number' ||
			typeof obj2 === 'boolean' ||
			typeof obj2 === 'bigint' ||
			Array.isArray(obj2))
	) {
		return obj2;
	}
	if (
		obj2 === undefined &&
		obj1 !== undefined &&
		(obj1 === null ||
			typeof obj1 === 'string' ||
			typeof obj1 === 'number' ||
			typeof obj1 === 'boolean' ||
			typeof obj1 === 'bigint' ||
			Array.isArray(obj1))
	) {
		return obj1;
	}
	if (obj1 === undefined || (typeof obj1 !== 'object' && typeof obj2 === 'object')) {
		return mergeDeep({}, obj2);
	}
	if (obj2 === undefined || (typeof obj2 !== 'object' && typeof obj1 === 'object')) {
		return mergeDeep(obj1, {});
	}
	if (obj1 && typeof obj1 === 'object' && typeof obj2 === 'object') {
		const newObj: { [key: string]: unknown } = {};
		for (const key of Object.keys(obj1)) {
			newObj[key] = mergeDeep((obj1 as { [key: string]: unknown })[key], (obj2 as { [key: string]: unknown })[key]);
		}
		for (const key of Object.keys(obj2)) {
			newObj[key] = mergeDeep((obj1 as { [key: string]: unknown })[key], (obj2 as { [key: string]: unknown })[key]);
		}
		return newObj;
	}
	throw new Error('Cannot merge objects');
};

export const bigintToBigNumber = (value: bigint, decimals: bigint): BigNumber =>
	new BigNumber(value.toString()).div((10n ** decimals).toString());

export const bigNumberToBigint = (value: BigNumber, decimals: bigint): bigint =>
	BigInt(
		addHexPrefix(
			value
				.times((10n ** decimals).toString())
				.integerValue()
				.toString(16)
		)
	);

export const getTransactionLink = (chain: IChain, transactionHash: string) => {
	const network = networks.find((network) => network.chain === chain);
	if (!network) {
		throw new Error('Cannot find network');
	}
	return network.getTransactionLink(transactionHash);
};

export const toHex = (value: string | number | bigint, prefix = true): string =>
	prefix ? addHexPrefix(BigInt(value).toString(16)) : BigInt(value).toString(16);

export const arrayBufferToString = (buffer: ArrayBuffer) => new TextDecoder().decode(new Uint8Array(buffer));

export const tokenToString = (amount: bigint, decimals: bigint): string => {
	let value = new BigNumber(amount.toString()).div((10n ** decimals).toString()).toFixed(10);
	if (new BigNumber(value).isZero() && amount !== 0n) {
		return new BigNumber(amount.toString()).div((10n ** decimals).toString()).toPrecision(10);
	}

	// Removes trailing zeros after decimal separator
	if (value.includes('.')) {
		while (value.slice(-1) === '0') {
			value = value.slice(0, -1);
		}
		if (value.slice(-1) === '.') {
			value = value.slice(0, -1);
		}
	}

	return value;
};

export const bigNumberToString = (value: BigNumber): string => {
	let s = value.toFixed(10);
	if (new BigNumber(s).isZero() && !value.isZero()) {
		return value.toPrecision(10);
	}

	// Removes trailing zeros after decimal separator
	if (s.includes('.')) {
		while (s.slice(-1) === '0') {
			s = s.slice(0, -1);
		}
		if (s.slice(-1) === '.') {
			s = s.slice(0, -1);
		}
	}

	return s;
};

export const cleanEthereumAddress = (address: string): string => address.trim().slice(-40).toLowerCase();

export const isTransactionPositive = (walletAddress: string, token: IToken, transaction: ITransaction): boolean =>
	transaction.type === 'received' ||
	(transaction.type === 'exchanged' &&
		transaction.exchange !== undefined &&
		cleanEthereumAddress(transaction.exchange.destTokenAddress) === cleanEthereumAddress(token.address) &&
		cleanEthereumAddress(transaction.exchange.destAddress) === cleanEthereumAddress(walletAddress)) ||
	(transaction.type === 'transfered' &&
		transaction.transfer !== undefined &&
		cleanEthereumAddress(transaction.transfer.destAddress) === cleanEthereumAddress(walletAddress));

export const useBrowser = () => {
	const [browser, setBrowser] = useState<ReturnType<typeof detect>>(null);

	useEffect(() => {
		setBrowser(detect());
	}, [setBrowser]);

	return browser;
};

export const getTokenFilters = (chainId: bigint) => defaultTokenFilters.filter((filter) => filter.chainId === chainId);

export const isEthereumChain = (chain: IChain): boolean => {
	switch (chain) {
		case 'bsc':
		case 'ethereum':
		case 'polygon':
			return true;
		default:
			return false;
	}
};

export const isBitcoinChain = (chain: IChain): boolean => chain === 'bitcoin';

export const sleep = (ms: number | bigint): Promise<void> =>
	new Promise<void>((resolve) => setTimeout(resolve, Number(ms)));

export const getKeys = <T>(obj: T): Array<keyof T> => Object.keys(obj) as Array<keyof T>;

export const getPasswordIssue = (password: string): string | undefined => {
	const specialCharacters = "&@^$#%*!?=_-'<>~,.;:+()[]{}/";
	if (password.length < 8) {
		return `Password's minimum length is 8. Also the password must include at least one digit, one upper case character, one lower case character and one special character: ${specialCharacters}`;
	}
	if (
		!password.match(/[0-9]/) ||
		!password.match(/[A-Z]/) ||
		!password.match(/[a-z]/) ||
		!password.match(/[&@^$#%*!?=_\-'<>~,.;:+()[\]{}/]/)
	) {
		return `The password must include at least one digit, one upper case character, one lower case character and one special character: ${specialCharacters}`;
	}
};

export const retry = async <T>(
	fn: () => Promise<T>,
	options: { delay: bigint; limit: bigint; growDelay: boolean } = { delay: 1000n, growDelay: true, limit: 7n }
): Promise<T> => {
	const { delay, growDelay, limit } = options;
	let counter = 0n;
	while (true) {
		try {
			return await fn();
		} catch (e) {
			if (get(e, 'response.status') === 429) {
				console.log(`RETRY: ${errorToString(e)}`);
				counter += 1n;
				if (limit > 0n && counter >= limit) {
					throw e;
				}
				await sleep(growDelay ? delay * 2n ** (counter - 1n) : delay);
			} else {
				throw e;
			}
		}
	}
};
