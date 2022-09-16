import { IAction, IPayloadAction } from 'store/types';
import { IChain } from 'types';

export interface IUserState {
	isAuthenticated: boolean;
	mnemonic: string;
	encryptedMnemonic: string;
	securityToken: string;
	password: string;
	nonces: Array<{ chain: IChain; nonce: bigint }>;
	settings: {
		askPasswordOnTransaction: boolean;
		isSessionTimeout: boolean;
	};
}

type IUpdateMnemonic = IPayloadAction<'updateMnemonic', { mnemonic: string }>;

type IUpdatePassword = IPayloadAction<'updatePassword', { password: string }>;

type ILogin = IPayloadAction<
	'login',
	{
		mnemonic: string;
		encryptedMnemonic: string;
		securityToken: string;
		settings: {
			askPasswordOnTransaction: boolean;
			isSessionTimeout: boolean;
		};
	}
>;

type ILogout = IAction<'logout'>;

type IUpdateAskPasswordOnTransaction = IPayloadAction<
	'updateAskPasswordOnTransaction',
	{ askPasswordOnTransaction: boolean }
>;

type IUpdateIsAutoSessionTimeout = IPayloadAction<'updateIsSessionTimeout', { isSessionTimeout: boolean }>;

type IUpdateNonce = IPayloadAction<'updateNonce', { chain: IChain; nonce: bigint }>;

export type IUserAction =
	| IUpdateMnemonic
	| IUpdatePassword
	| ILogin
	| ILogout
	| IUpdateAskPasswordOnTransaction
	| IUpdateIsAutoSessionTimeout
	| IUpdateNonce;
