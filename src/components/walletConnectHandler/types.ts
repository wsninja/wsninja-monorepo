import { TxData } from '@ethereumjs/tx';
import { MessageTypes, TypedDataV1, TypedMessage } from '@metamask/eth-sig-util';

export type IWalletConnectRequestType =
	| 'session_request'
	| 'eth_sendTransaction'
	| 'personal_sign'
	| 'eth_sign'
	| 'eth_signTypedData'
	| 'eth_signTransaction'
	| 'eth_sendRawTransaction'
	| 'wc_sessionRequest';

interface IWalletConnectPayload<T extends IWalletConnectRequestType, P> {
	id: number;
	jsonrpc: string; // '2.0'
	method: T;
	params: Array<P>;
}

export type ISessionRequestPayload = IWalletConnectPayload<
	'session_request',
	{
		chainId: number;
		peerId: string;
		peerMeta: {
			description: string;
			icons: Array<string>;
			name: string;
			url: string;
		};
	}
>;

export type IWcSessionRequestPayload = IWalletConnectPayload<
	'wc_sessionRequest',
	{
		chainId: number;
		peerId: string;
		peerMeta: {
			description: string;
			icons: Array<string>;
			name: string;
			url: string;
		};
	}
>;

export type IEthSendTransactionPayload = IWalletConnectPayload<
	'eth_sendTransaction',
	{
		from: string;
		to: string;
		maxFeePerGas: string;
		maxPriorityFeePerGas: string;
		value?: string;
		data?: string;
	}
> & { preparedTransaction?: TxData; from?: string };

export type IPersonalSignPayload = IWalletConnectPayload<'personal_sign', string>;

export type IEthSignPayload = IWalletConnectPayload<'eth_sign', string>;

export type IEthSignTypedDataPayload = IWalletConnectPayload<
	'eth_signTypedData',
	string | TypedDataV1 | TypedMessage<MessageTypes>
>;

export type IEthSignTransaction = IWalletConnectPayload<
	'eth_signTransaction',
	{ from: string; to?: string; data?: string; value?: string; gas?: string; gasPrice?: string; nonce?: string }
>;

export type IEthSendRawTransaction = IWalletConnectPayload<'eth_sendRawTransaction', {}>;

export type IWalletConnectRequest =
	| ISessionRequestPayload
	| IWcSessionRequestPayload
	| IEthSendTransactionPayload
	| IPersonalSignPayload
	| IEthSignPayload
	| IEthSignTypedDataPayload
	| IEthSignTransaction
	| IEthSendRawTransaction;
