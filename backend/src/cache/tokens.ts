import { logError, logMessage } from 'utils/base';
import { getMarkets, IMarketsToken } from 'utils/coingecko';

const tokenCache: {
	tokens: Array<IMarketsToken>;
	timestamp: number;
} = {
	tokens: [],
	timestamp: 0,
};

export const getCachedTokens = (): Array<IMarketsToken> => tokenCache.tokens;

const run = async () => {
	try {
		const timestamp = Date.now();
		const tokens = await getMarkets();
		if (tokenCache.timestamp < timestamp) {
			tokenCache.tokens = tokens;
			tokenCache.timestamp = timestamp;
			logMessage('Token cache updated');
		}
	} catch (e) {
		logError(e);
	}
};

export const initTokenCache = () => {
	setInterval(run, 1000 * 60 * 10); // 10 minutes
	run();
};
