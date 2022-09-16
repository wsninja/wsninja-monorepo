import { ISwapAction } from 'store/swap/types';
import { ISwapToken } from 'types';

export const updateSwapTokens = (tokens: Array<ISwapToken>): ISwapAction => ({
	type: 'updateSwapTokens',
	payload: { tokens },
});
