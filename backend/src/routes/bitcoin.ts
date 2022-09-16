import { getUnspentOutputs, sendTransaction } from 'controllers/bitcoin';
import { AsyncRouter } from 'express-async-router';

export const bitcoinRouter = AsyncRouter();

bitcoinRouter.post('/getUnspentOutputs', getUnspentOutputs);
bitcoinRouter.post('/sendTransaction', sendTransaction);
