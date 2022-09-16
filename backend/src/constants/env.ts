import { logError } from 'utils/base';

require('dotenv').config();

type IEnvProperties =
	| 'ADMIN_PASSWORD_HASH'
	| 'ADMIN_PASSWORD_SALT'
	| 'BSC_RPC_URL_1'
	| 'BSC_RPC_URL_2'
	| 'COVALENT_API_KEY'
	| 'DB_PATH'
	| 'ETHEREUM_RPC_URL_1'
	| 'ETHEREUM_RPC_URL_2'
	| 'HOST'
	| 'POLYGON_RPC_URL_1'
	| 'POLYGON_RPC_URL_2'
	| 'PORT'
	| 'REFERRER_ADDRESS'
	| 'REFERRER_FEE'
	| 'SIGNING_PASSWORD';

const exitWithErrorMessage = (errorMessage: string): never => {
	logError(errorMessage);
	process.exit(1);
};

const getEnvString = (property: IEnvProperties): string => {
	const value = process.env[property];
	if (value === undefined) {
		return exitWithErrorMessage(`Environment variable ${property} is undefined`);
	}
	return value;
};

const getEnvNumber = (property: IEnvProperties): number => {
	const value = process.env[property];
	if (value === undefined) {
		return exitWithErrorMessage(`Environment variable ${property} is undefined`);
	}
	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) {
		return exitWithErrorMessage(`Environment variable ${property} is not a number`);
	}
	return numberValue;
};

export const ADMIN_PASSWORD_HASH = getEnvString('ADMIN_PASSWORD_HASH');
export const ADMIN_PASSWORD_SALT = getEnvString('ADMIN_PASSWORD_SALT');
export const BSC_RPC_URL_1 = getEnvString('BSC_RPC_URL_1');
export const BSC_RPC_URL_2 = getEnvString('BSC_RPC_URL_2');
export const COVALENT_API_KEY = getEnvString('COVALENT_API_KEY');
export const DB_PATH = getEnvString('DB_PATH');
export const ETHEREUM_RPC_URL_1 = getEnvString('ETHEREUM_RPC_URL_1');
export const ETHEREUM_RPC_URL_2 = getEnvString('ETHEREUM_RPC_URL_2');
export const HOST = getEnvString('HOST');
export const POLYGON_RPC_URL_1 = getEnvString('POLYGON_RPC_URL_1');
export const POLYGON_RPC_URL_2 = getEnvString('POLYGON_RPC_URL_2');
export const PORT = getEnvNumber('PORT');
export const REFERRER_ADDRESS = getEnvString('REFERRER_ADDRESS');
export const REFERRER_FEE = getEnvNumber('REFERRER_FEE');
export const SIGNING_PASSWORD = getEnvString('SIGNING_PASSWORD');
