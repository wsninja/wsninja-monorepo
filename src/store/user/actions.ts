import { IUserAction } from 'store/user/types';
import { IChain } from 'types';

export const updateMnemonic = (mnemonic: string): IUserAction => ({
	type: 'updateMnemonic',
	payload: { mnemonic },
});

export const updatePassword = (password: string): IUserAction => ({ type: 'updatePassword', payload: { password } });

export const login = (
	mnemonic: string,
	encryptedMnemonic: string,
	securityToken: string,
	settings: {
		askPasswordOnTransaction: boolean;
		isSessionTimeout: boolean;
	}
): IUserAction => ({
	type: 'login',
	payload: { mnemonic, encryptedMnemonic, securityToken, settings },
});

export const logout = (): IUserAction => ({ type: 'logout' });

export const updateAskPasswordOnTransaction = (askPasswordOnTransaction: boolean): IUserAction => ({
	type: 'updateAskPasswordOnTransaction',
	payload: { askPasswordOnTransaction },
});

export const updateIsSessionTimeout = (isSessionTimeout: boolean): IUserAction => ({
	type: 'updateIsSessionTimeout',
	payload: { isSessionTimeout },
});

export const updateNonce = (chain: IChain, nonce: bigint): IUserAction => ({
	type: 'updateNonce',
	payload: { chain, nonce },
});
