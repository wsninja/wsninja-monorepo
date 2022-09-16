import crypto from 'crypto';
import { keccakFromString } from 'ethereumjs-util';

const createAdminPassword = () => {
	const password = crypto.randomBytes(32).toString('hex');
	const salt = crypto.randomBytes(32).toString('hex');
	const passwordHash = keccakFromString(password + salt).toString('hex');

	console.log(`Password: ${password}`);
	console.log(`Password Hash: ${passwordHash}`);
	console.log(`Salt: ${salt}`);
};

createAdminPassword();
