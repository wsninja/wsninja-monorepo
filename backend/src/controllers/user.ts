import { stringify } from '@softstack/typed-stringify';
import { SIGNING_PASSWORD } from 'constants/env';
import { AES } from 'crypto-js';
import {
	addUser as db_addUser,
	getUserSettings as db_getUserSettings,
	setAskPasswordOnTransaction as db_setAskPasswordOnTransaction,
	setIsSessionTimeout as db_setIsSessionTimeout,
} from 'db/user';
import { publicToAddress } from 'ethereumjs-util';
import { Request, Response } from 'express';
import { ISecurityToken } from 'types';
import { HttpError } from 'utils/httpError';
import { checkSignature, parseRequest, parseSignedRequest, sendResponse } from 'utils/utils';

interface IAddUserRequest {
	publicKey: string;
	isoDate: string;
	v: string;
	r: string;
	s: string;
}

interface IAddUserResponse {
	securityToken: string;
	newUser: boolean;
}

export const addUser = async (req: Request, res: Response) => {
	const {
		payload: { publicKey, isoDate, v, r, s },
	} = parseRequest<IAddUserRequest>(req);
	if (!checkSignature(publicKey, isoDate, v, r, s)) {
		throw new HttpError(400, 'Invalid signature');
	}
	const address = publicToAddress(Buffer.from(publicKey, 'hex')).toString('hex');
	const userId = await db_addUser(publicKey, address);
	const securityToken = AES.encrypt(
		stringify<ISecurityToken>({ publicKey, address, createdAt: new Date() }),
		SIGNING_PASSWORD
	).toString();
	return sendResponse<IAddUserResponse>(res, { securityToken, newUser: userId !== undefined });
};

type ISetAskPasswordOnTransactionRequest = { value: boolean };

export const setAskPasswordOnTransaction = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { value },
	} = parseSignedRequest<ISetAskPasswordOnTransactionRequest>(req);
	await db_setAskPasswordOnTransaction(publicKey, value);
	return sendResponse(res, undefined);
};

interface ISetIsSessionTimeoutRequest {
	value: boolean;
}

export const setIsSessionTimeout = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { value },
	} = parseSignedRequest<ISetIsSessionTimeoutRequest>(req);
	await db_setIsSessionTimeout(publicKey, value);
	return sendResponse(res, undefined);
};

interface IGetUserSettingsResponse {
	askPasswordOnTransaction: boolean;
	isSessionTimeout: boolean;
}

export const getUserSettings = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userSettings = await db_getUserSettings(publicKey);
	if (!userSettings) {
		return sendResponse<IGetUserSettingsResponse>(res, { askPasswordOnTransaction: true, isSessionTimeout: true });
	}
	const { askPasswordOnTransaction, isSessionTimeout } = userSettings;
	return sendResponse<IGetUserSettingsResponse>(res, { askPasswordOnTransaction, isSessionTimeout });
};
