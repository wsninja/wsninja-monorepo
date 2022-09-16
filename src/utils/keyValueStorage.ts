import { parse, stringify } from '@softstack/typed-stringify';
import { IStringIndexed } from 'types';

const storageKey = '417755fc7d36f574505e8c127c84008cd1e74436b2b5aa2c53fe3fd06ab0a304';
const storage = sessionStorage;

export class KeyValueStorage {
	async getKeys(): Promise<string[]> {
		const obj = storage.getItem(storageKey);
		if (obj) {
			const store = parse(obj) as IStringIndexed<any>;
			return Object.keys(store);
		}
		return [];
	}

	async getEntries<T = any>(): Promise<[string, T][]> {
		const obj = storage.getItem(storageKey);
		if (obj) {
			const store = parse(obj) as IStringIndexed<any>;
			const keys = Object.keys(store);
			return keys.map((key) => [key, store[key]]);
		}
		return [];
	}

	async getItem<T = any>(key: string): Promise<T | undefined> {
		const obj = storage.getItem(storageKey);
		if (obj) {
			const store = parse(obj) as IStringIndexed<any>;
			return store[key];
		}
	}

	async setItem<T = any>(key: string, value: T): Promise<void> {
		const obj = storage.getItem(storageKey);
		if (obj) {
			const store = parse(obj) as IStringIndexed<any>;
			store[key] = value;
			storage.setItem(storageKey, stringify(store));
		} else {
			const store: IStringIndexed<any> = {};
			store[key] = value;
			storage.setItem(storageKey, stringify(store));
		}
	}

	async removeItem(key: string): Promise<void> {
		const obj = storage.getItem(storageKey);
		if (obj) {
			const store = parse(obj) as IStringIndexed<any>;
			delete store[key];
			storage.setItem(storageKey, stringify(store));
		}
	}
}
