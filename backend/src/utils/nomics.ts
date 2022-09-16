import axios from 'axios';
import { URL } from 'url';
import { sleep } from 'utils/base';

const getTickerPage = async (pageNumber: bigint, ids: Array<string>) => {
	const url = new URL('https://api.nomics.com');
	url.pathname = '/v1/currencies/ticker';
	url.searchParams.append('key', '9c6bb0931d552b20c7df213732f4d7b95d5712ac');
	url.searchParams.append('ids', ids.join(','));
	url.searchParams.append('interval', '1d');
	url.searchParams.append('per-page', '100');
	url.searchParams.append('page', pageNumber.toString());
	let response;
	do {
		response = await axios.get(url.toString()).catch(async (e) => {
			if (e.response.status === 429) {
				await sleep(1000);
				return undefined;
			}
			throw e;
		});
	} while (response === undefined);
	return response;
};

export const getNomicsTicker = async (ids: Array<string>) => {
	let prices = new Array<any>();

	let pageNumber = 0n;
	let maxPageNumber = 0n;
	do {
		pageNumber += 1n;
		if (pageNumber > 1n) {
			await sleep(1000);
		}
		const response = await getTickerPage(pageNumber, ids);
		if (pageNumber === 1n) {
			const totalItems = BigInt(response.headers['x-pagination-total-items']);
			maxPageNumber = totalItems / 100n;
			if (totalItems % 100n > 0n) {
				maxPageNumber += 1n;
			}
		}
		prices = prices.concat(response.data);
	} while (pageNumber < maxPageNumber);
	return prices;
};
