import BigNumber from 'bignumber.js';
import { get } from 'lodash';

const hasOwnProperty = <X, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> =>
	Object.prototype.hasOwnProperty.call(obj, prop);

export const errorToString = (error: unknown): string => {
	try {
		if (typeof error === 'string') {
			return error;
		}
		if (
			typeof error === 'number' ||
			typeof error === 'bigint' ||
			typeof error === 'boolean' ||
			error instanceof Error
		) {
			return error.toString();
		}
		if (typeof error === 'object' && error && hasOwnProperty(error, 'message') && typeof error.message === 'string') {
			return error.message;
		}
		if (typeof error === 'object' && error && Object.prototype.toString.call(error) !== '[object Object]') {
			return Object.prototype.toString.call(error);
		}
		if (typeof error === 'object') {
			return JSON.stringify(error);
		}
	} catch (e) {
		console.error(e);
	}
	return 'Unknown error';
};

export const pow = (base: bigint, exp: bigint): bigint =>
	BigInt(new BigNumber(base.toString()).pow(exp.toString()).toString());

export const cleanEthereumAddress = (address: string): string => address.trim().slice(-40).toLowerCase();

export const cleanPublicKey = (publicKey: string): string => publicKey.trim().toLowerCase();

export const toHex = (value: string | number | bigint, prefix = true): string =>
	prefix ? `0x${BigInt(value).toString(16)}` : BigInt(value).toString(16);

export const sleep = (ms: number | bigint): Promise<void> => new Promise((resolve) => setTimeout(resolve, Number(ms)));

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
				logError(`RETRY: ${errorToString(e)}`);
				counter += 1n;
				if (limit > 0n && counter >= limit) {
					throw e;
				}
				await sleep(growDelay ? delay * pow(2n, counter - 1n) : delay);
			} else {
				throw e;
			}
		}
	}
};

export const logError = (error: unknown) => console.error(`${new Date().toISOString()} ERROR: ${errorToString(error)}`);

export const logMessage = (message: string) => console.log(`${new Date().toISOString()} LOG: ${message}`);
