type Entry<K = string, V = any> = [K, V | null];
type Entries<K = string, V = any> = Array<Entry<K, V>>;
type ErrBack<V = any> = (err: Error | null, val?: V | null) => {};
type ArrErrBack<V = any> = (err: Array<Error> | null, val?: V) => {};

export class AsyncStorage<K = string, V = any> {
	store: Map<K, V | null>;

	constructor() {
		this.store = new Map<K, V | null>();
	}

	size(): number {
		return this.store.size;
	}

	getStore(): Map<K, V | null> {
		return this.store;
	}

	async getItem(k: K, cb?: ErrBack<V>): Promise<V | null> {
		const value = this.store.get(k) ?? null;
		if (cb) {
			cb(null, value);
		}
		return value;
	}

	async setItem(k: K, v: V, cb?: ErrBack<V>): Promise<void> {
		this.store.set(k, v);
		if (cb) {
			cb(null, v);
		}
	}

	async removeItem(k: K, cb?: ErrBack<V>): Promise<void> {
		this.store.delete(k);
		if (cb) {
			cb(null, null);
		}
	}

	async clear(cb?: ErrBack<V>): Promise<void> {
		this.store.clear();
		if (cb) {
			cb(null, null);
		}
	}

	async getAllKeys(cb?: ErrBack<Array<K>>): Promise<Array<K>> {
		const keys = this.store.keys();
		const stringKeys = Array<K>();
		for (const key of keys) {
			stringKeys.push(key);
		}
		if (cb) {
			cb(null, stringKeys);
		}
		return stringKeys;
	}

	async multiGet(keys: Array<K>, cb?: ErrBack<Entries<K, V>>): Promise<Entries<K, V>> {
		const entries: Entries<K, V> = [];
		keys.forEach((key) => entries.push([key, this.store.get(key) ?? null]));
		if (cb) {
			cb(null, entries);
		}
		return entries;
	}

	async multiSet(entries: Entries<K, V>, cb?: ErrBack<V>): Promise<void> {
		entries.forEach(([key, value]) => this.store.set(key, value));
		if (cb) {
			cb(null, null);
		}
	}

	async multiRemove(keys: Array<K>, cb?: ErrBack<V>): Promise<void> {
		keys.forEach((key) => this.store.delete(key));
		if (cb) {
			cb(null, null);
		}
	}

	async mergeItem(key: string, value: string, cb?: ErrBack<string>): Promise<void> {
		throw new Error('mergeItem() not implemented');
	}

	async multiMerge(entries: Entries<string, string>, cb?: ArrErrBack<string>): Promise<void> {
		throw new Error('multiMerge() not implemented');
	}

	flushGetRequests(): any {}
}
