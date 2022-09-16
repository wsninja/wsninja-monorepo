type IEnvProperties = 'BACKEND_URL' | 'TESTING';

const getEnvString = (property: IEnvProperties): string => {
	const value = process.env[`REACT_APP_${property}`];
	if (value === undefined) {
		throw new Error(`Environment variable ${property} is undefined`);
	}
	return value;
};

const getEnvNumber = (property: IEnvProperties): number => {
	const value = process.env[`REACT_APP_${property}`];
	if (value === undefined) {
		throw new Error(`Environment variable ${property} is undefined`);
	}
	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) {
		throw new Error(`Environment variable ${property} is not a number`);
	}
	return numberValue;
};

export const BACKEND_URL = getEnvString('BACKEND_URL');
export const TESTING = getEnvNumber('TESTING');
