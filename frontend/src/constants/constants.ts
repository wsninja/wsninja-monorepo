import { keccak256 } from 'ethereumjs-util';

export const bitcoinTokenHash = keccak256(Buffer.from('btc', 'utf8')).toString('hex');
