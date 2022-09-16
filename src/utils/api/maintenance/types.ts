export interface IGetDatabaseRequest {
	password: string;
}

export interface IGetDatabaseResponse {
	file: string;
}

export interface ISetDatabaseRequest {
	password: string;
	file: string;
}
