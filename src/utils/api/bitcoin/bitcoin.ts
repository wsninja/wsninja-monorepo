import { signedPost } from 'utils/api/api';
import {
	IGetUnspentOutputsRequest,
	IGetUnspentOutputsResponse,
	ISendTransactionRequest,
	ISendTransactionResponse,
} from 'utils/api/bitcoin/types';

export const getUnspentOutputs = (payload: IGetUnspentOutputsRequest, securityToken: string) =>
	signedPost<IGetUnspentOutputsResponse>('/api/bitcoin/getUnspentOutputs', payload, securityToken);

export const sendTransaction = (payload: ISendTransactionRequest, securityToken: string) =>
	signedPost<ISendTransactionResponse>('/api/bitcoin/sendTransaction', payload, securityToken);
