import { getAllowanceTransaction, getReferrerFee, getSwapTransaction, getTokens } from 'controllers/swap';
import { AsyncRouter } from 'express-async-router';

export const swapRouter = AsyncRouter();

swapRouter.post('/getTokens', getTokens);
swapRouter.post('/getAllowanceTransaction', getAllowanceTransaction);
swapRouter.post('/getSwapTransaction', getSwapTransaction);
swapRouter.post('/getReferrerFee', getReferrerFee);
