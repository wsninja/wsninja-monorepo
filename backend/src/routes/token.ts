import {
	addCustomToken,
	addHiddenToken,
	addWatchedToken,
	deleteHiddenToken,
	deleteWatchedToken,
	getCustomTokens,
	getHiddenTokens,
	getTokenPrice,
	getWatchedTokens,
} from 'controllers/token';
import { AsyncRouter } from 'express-async-router';

export const tokenRouter = AsyncRouter();

tokenRouter.post('/getTokenPrice', getTokenPrice);
tokenRouter.post('/addCustomToken', addCustomToken);
tokenRouter.post('/getCustomTokens', getCustomTokens);
tokenRouter.post('/addWatchedToken', addWatchedToken);
tokenRouter.post('/deleteWatchedToken', deleteWatchedToken);
tokenRouter.post('/getWatchedTokens', getWatchedTokens);
tokenRouter.post('/addHiddenToken', addHiddenToken);
tokenRouter.post('/getHiddenTokens', getHiddenTokens);
tokenRouter.post('/deleteHiddenToken', deleteHiddenToken);
