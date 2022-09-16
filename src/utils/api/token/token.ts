import { signedPost } from 'utils/api/api';
import {
	IAddHiddenTokenRequest,
	IAddHiddenTokenResponse,
	IDeleteHiddenTokenRequest,
	IGetHiddenTokensResponse,
} from 'utils/api/token/types';

export const addHiddenToken = (payload: IAddHiddenTokenRequest, securityToken: string) =>
	signedPost<IAddHiddenTokenResponse>('/api/token/addHiddenToken', payload, securityToken);

export const getHiddenTokens = (securityToken: string) =>
	signedPost<IGetHiddenTokensResponse>('/api/token/getHiddenTokens', undefined, securityToken);

export const deleteHiddenToken = (payload: IDeleteHiddenTokenRequest, securityToken: string) =>
	signedPost('/api/token/deleteHiddenToken', payload, securityToken);
