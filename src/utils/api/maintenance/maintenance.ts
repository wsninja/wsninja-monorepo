import { post } from 'utils/api/api';
import { IGetDatabaseRequest, IGetDatabaseResponse, ISetDatabaseRequest } from 'utils/api/maintenance/types';

export const getDatabase = (payload: IGetDatabaseRequest) =>
	post<IGetDatabaseResponse>('/api/maintenance/getDatabase', payload);

export const setDatabase = (payload: ISetDatabaseRequest) => post('/api/maintenance/setDatabase', payload);
