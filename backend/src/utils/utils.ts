import { parse, stringify } from '@softstack/typed-stringify';
import BigNumber from 'bignumber.js';
import { chains } from 'constants/constants';
import {
	ADMIN_PASSWORD_HASH,
	ADMIN_PASSWORD_SALT,
	BSC_RPC_URL_1,
	ETHEREUM_RPC_URL_1,
	POLYGON_RPC_URL_1,
	SIGNING_PASSWORD,
} from 'constants/env';
import { networks } from 'constants/networks';
import { AES, enc } from 'crypto-js';
import { addHexPrefix, ecrecover, keccak256, keccakFromString } from 'ethereumjs-util';
import { Request, Response } from 'express';
import { IBaseRequest, IChain, IExtSignedRequest, ISecurityToken, ISignedRequest } from 'types';
import { HttpError } from 'utils/httpError';

export const getRpcUrl = (chainId: bigint): string => {
	switch (chainId) {
		case 1n:
			return ETHEREUM_RPC_URL_1;
		case 56n:
			return BSC_RPC_URL_1;
		case 137n:
			return POLYGON_RPC_URL_1;
		default:
			throw new Error('Unknown chain id');
	}
};

export const parseRequest = <T extends {} = {}>(req: Request): IBaseRequest<T> =>
	parse(req.body.data) as IBaseRequest<T>;

export const sendResponse = <T>(res: Response, data: T) => res.json({ data: stringify(data) });

export const checkSignature = (publicKey: string, isoDate: string, v: string, r: string, s: string): boolean => {
	const date = new Date(isoDate);
	if (date.getTime() >= Date.now() - 1000 * 60 * 5 && date.getTime() <= Date.now() + 1000 * 60 * 5) {
		const hash = keccak256(Buffer.from(isoDate, 'utf8'));
		const recoveredPublicKey = ecrecover(
			hash,
			Buffer.from(v, 'hex'),
			Buffer.from(r, 'hex'),
			Buffer.from(s, 'hex')
		).toString('hex');

		return publicKey.toLowerCase() === recoveredPublicKey.toLowerCase();
	}
	return false;
};

export const parseSignedRequest = <T extends {} = {}>(req: Request): IExtSignedRequest<T> => {
	const { securityToken, payload } = parse(req.body.data) as ISignedRequest<T>;
	const decryptedSecurityToken = AES.decrypt(securityToken, SIGNING_PASSWORD).toString(enc.Utf8);
	if (!decryptedSecurityToken) {
		throw new HttpError(401, 'Invalid security token'); // Unauthorized
	}
	const { publicKey, address, createdAt } = parse(decryptedSecurityToken) as ISecurityToken;
	if (createdAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30 && createdAt.getTime() > Date.now()) {
		throw new HttpError(401, 'Invalid security token'); // Unauthorized
	}
	return { securityToken, publicKey, address, payload };
};

export const getChainInfo = (chainId: bigint | IChain) => {
	if (typeof chainId === 'bigint') {
		const chain = chains.find((chain) => chain.chainId === chainId);
		if (!chain) {
			throw new Error('Unknown chain id');
		}
		return chain;
	} else {
		const chain = chains.find((chain) => chain.chain === chainId);
		if (!chain) {
			throw new Error('Unknown chain id');
		}
		return chain;
	}
};

export const bigintToBigNumber = (value: bigint, decimals: bigint): BigNumber =>
	new BigNumber(value.toString()).div(new BigNumber(10).pow(decimals.toString()));

export const bigNumberToBigint = (value: BigNumber, decimals: bigint): bigint =>
	BigInt(
		addHexPrefix(
			value
				.times((10n ** decimals).toString())
				.integerValue()
				.toString(16)
		)
	);

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

export const checkAdminPassword = (password: string) => {
	const passwordHash = keccakFromString(password + ADMIN_PASSWORD_SALT).toString('hex');
	return passwordHash === ADMIN_PASSWORD_HASH;
};

export const throwIfNotAdminPassword = (password: string) => {
	if (!checkAdminPassword(password)) {
		throw new Error('Invalid password');
	}
};
