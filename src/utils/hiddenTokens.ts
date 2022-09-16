import { store } from 'store/store';
import {
	addHiddenToken as redux_addHiddenToken,
	deleteHiddenToken as redux_deleteHiddenToken,
	updateHiddenTokens,
} from 'store/wallet/actions';
import {
	addHiddenToken as api_addHiddenToken,
	deleteHiddenToken as api_deleteHiddenToken,
	getHiddenTokens as api_getHiddenTokens,
} from 'utils/api/token/token';

export const addHiddenToken = async (chainId: bigint, address: string, securityToken: string) => {
	store.dispatch(redux_addHiddenToken(chainId, address));
	await api_addHiddenToken({ chainId, address }, securityToken);
};

export const getHiddenTokens = async (securityToken: string) => {
	const { hiddenTokens } = await api_getHiddenTokens(securityToken);
	store.dispatch(updateHiddenTokens(hiddenTokens));
};

export const deleteHiddenToken = async (chainId: bigint, address: string, securityToken: string) => {
	store.dispatch(redux_deleteHiddenToken(chainId, address));
	await api_deleteHiddenToken({ chainId, address }, securityToken);
};
