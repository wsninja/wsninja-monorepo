import { IChain } from 'types';

export interface IGetHistoricValuePriceRequest {
	chain: IChain;
	date: Date;
}

export interface IGetHistoricValuePriceResponse {
	valuePriceInUSD: number;
}
