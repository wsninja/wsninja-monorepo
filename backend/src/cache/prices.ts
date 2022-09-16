import { IChain, IStringIndexed } from 'types';
import { getHistory } from 'utils/coingecko';
import { getChainInfo } from 'utils/utils';

const historyPricesCache: IStringIndexed<number> = {};

export const getCachedHistoryPriceInUSD = async (chain: IChain, date: Date): Promise<number> => {
	const key = date.toISOString().split('T')[0];
	let value = historyPricesCache[key];
	if (value !== undefined) {
		return value;
	}
	const { coinGeckoId } = getChainInfo(chain);
	const history = await getHistory(coinGeckoId, date);
	value = history.market_data.current_price.usd;
	historyPricesCache[key] = value;
	return value;
};
