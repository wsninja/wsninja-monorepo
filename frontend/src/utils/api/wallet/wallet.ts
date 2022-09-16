import { signedPost } from 'utils/api/api';
import { IGetHistoricValuePriceRequest, IGetHistoricValuePriceResponse } from 'utils/api/wallet/types';

export const getHistoricValuePrice = (payload: IGetHistoricValuePriceRequest, securityToken: string) =>
	signedPost<IGetHistoricValuePriceResponse>('/api/wallet/getHistoricValuePrice', payload, securityToken);
