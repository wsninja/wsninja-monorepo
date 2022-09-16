import { addUser, getUserSettings, setAskPasswordOnTransaction, setIsSessionTimeout } from 'controllers/user';
import { AsyncRouter } from 'express-async-router';

export const userRouter = AsyncRouter();

userRouter.post('/addUser', addUser);
userRouter.post('/setAskPasswordOnTransaction', setAskPasswordOnTransaction);
userRouter.post('/setIsSessionTimeout', setIsSessionTimeout);
userRouter.post('/getUserSettings', getUserSettings);
