import { IPayloadAction } from 'store/types';
import { ISwapToken, ISwapTokenFilter } from 'types';

export interface ISwapState {
	tokens: Array<ISwapToken>;
	tokenFilters: Array<ISwapTokenFilter>;
}

type IUpdateSwapTokens = IPayloadAction<'updateSwapTokens', { tokens: Array<ISwapToken> }>;

export type ISwapAction = IUpdateSwapTokens;
