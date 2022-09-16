import { getCachedTokens } from 'cache/tokens';
import { chainIds } from 'constants/constants';
import { ISwapToken } from 'types';
import { logError, logMessage } from 'utils/base';
import { getTokens as getOneInchTokens } from 'utils/oneinch';

const swapTokenCache: {
	tokens: Array<ISwapToken>;
	timestamp: number;
} = {
	tokens: [],
	timestamp: 0,
};

export const getCachedSwapTokens = (): Array<ISwapToken> => swapTokenCache.tokens;

const run = async () => {
	try {
		const timestamp = Date.now();
		let tokens = new Array<ISwapToken>();
		const cachedTokens = await getCachedTokens();
		for (const chainId of chainIds) {
			const oneInchTokens = await getOneInchTokens(chainId);
			oneInchTokens.sort((a, b) => (a.symbol.toLowerCase() < b.symbol.toLowerCase() ? -1 : 1));
			tokens = tokens.concat(
				oneInchTokens.map(({ symbol, name, address, decimals, logoUri }) => {
					let priceInUsd: number | undefined;
					const cashedToken = cachedTokens.find(
						(coingeckoToken) => coingeckoToken.symbol.toLowerCase() === symbol.toLowerCase()
					);
					if (cashedToken && cashedToken.current_price) {
						priceInUsd = cashedToken.current_price;
					}
					return {
						chainId,
						symbol,
						name,
						address,
						decimals,
						logoUri,
						priceInUsd,
					};
				})
			);
		}
		if (swapTokenCache.timestamp < timestamp) {
			swapTokenCache.tokens = tokens;
			swapTokenCache.timestamp = timestamp;
			logMessage('Swap token cache updated');
		}
	} catch (e) {
		logError(e);
	}
};

export const initSwapTokenCache = () => {
	setInterval(run, 1000 * 60 * 60); // 1 hour
	run();
};
