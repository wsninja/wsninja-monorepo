import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { PrivateKey } from 'bitcore-lib';
import base58 from 'bs58';
import { TESTING } from 'constants/env';
import { AES, enc } from 'crypto-js';
import { addHexPrefix, privateToAddress, privateToPublic, ripemd160, sha256, toBuffer } from 'ethereumjs-util';

export const encrypt = (value: string, password: string): string => {
	if (!value) {
		throw new Error('Cannot encrypt empty string');
	}
	return AES.encrypt(value, password).toString();
};

export const decrypt = (encryptedValue: string, password: string): string | undefined => {
	try {
		const decrypted = AES.decrypt(encryptedValue, password).toString(enc.Utf8);
		if (!decrypted) {
			return undefined;
		}
		return decrypted;
	} catch (e) {
		return undefined;
	}
};

export const getEthereumKeys = (mnemonic: string): { privateKey: string; publicKey: string; address: string } => {
	const seed = mnemonicToSeedSync(mnemonic);
	const hdKey1 = HDKey.fromMasterSeed(seed);
	const hdKey2 = hdKey1.derive("m/44'/60'/0'/0/0");
	if (hdKey2.privateKey === null || hdKey2.publicKey === null) {
		throw new Error('Cannot create key');
	}
	let privateKey = '';
	for (const byte of hdKey2.privateKey) {
		privateKey += byte.toString(16).padStart(2, '0');
	}
	const privateKeyBuffer = toBuffer(addHexPrefix(privateKey));
	const publicKey = privateToPublic(privateKeyBuffer).toString('hex');
	const address = addHexPrefix(privateToAddress(privateKeyBuffer).toString('hex'));
	return { privateKey, publicKey, address };
};

export const getBitcoinKeys = (mnemonic: string): { privateKey: string; publicKey: string; address: string } => {
	const seed = mnemonicToSeedSync(mnemonic);
	const hdKey1 = HDKey.fromMasterSeed(seed);
	const hdKey2 = hdKey1.derive("m/44'/0'/0'/0/0");
	if (hdKey2.privateKey === null || hdKey2.publicKey === null) {
		throw new Error('Cannot create key');
	}
	let hexPrivateKey = '';
	for (const byte of hdKey2.privateKey) {
		hexPrivateKey += byte.toString(16).padStart(2, '0');
	}
	const privateKey = new PrivateKey(hexPrivateKey);
	const publicKey = privateKey.toPublicKey();
	const a = (TESTING ? '6f' : '00') + ripemd160(sha256(publicKey.toBuffer()), false).toString('hex');
	const b = sha256(sha256(Buffer.from(a, 'hex')))
		.toString('hex')
		.slice(0, 8);
	const c = a + b;
	const address = base58.encode(Buffer.from(c, 'hex'));
	return { privateKey: privateKey.toWIF(), publicKey: publicKey.toBuffer().toString('hex'), address };
};
