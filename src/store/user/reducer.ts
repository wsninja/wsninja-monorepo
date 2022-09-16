import { IUserAction, IUserState } from 'store/user/types';

export const initialUserState: IUserState = {
	isAuthenticated: false,
	mnemonic: '',
	encryptedMnemonic: '',
	securityToken: '',
	password: '',
	nonces: [],
	settings: {
		askPasswordOnTransaction: true,
		isSessionTimeout: true,
	},
};

export const userReducer = (state = initialUserState, action: IUserAction): IUserState => {
	switch (action.type) {
		case 'updateMnemonic':
			return { ...state, mnemonic: action.payload.mnemonic };
		case 'updatePassword':
			return { ...state, password: action.payload.password };
		case 'login':
			return {
				...state,
				isAuthenticated: true,
				password: '',
				mnemonic: action.payload.mnemonic,
				encryptedMnemonic: action.payload.encryptedMnemonic,
				securityToken: action.payload.securityToken,
				nonces: [],
				settings: {
					...state.settings,
					askPasswordOnTransaction: action.payload.settings.askPasswordOnTransaction,
					isSessionTimeout: action.payload.settings.isSessionTimeout,
				},
			};
		case 'logout':
			return {
				...state,
				isAuthenticated: false,
				password: '',
				mnemonic: '',
				securityToken: '',
				nonces: [],
			};
		case 'updateAskPasswordOnTransaction':
			return {
				...state,
				settings: { ...state.settings, askPasswordOnTransaction: action.payload.askPasswordOnTransaction },
			};
		case 'updateIsSessionTimeout':
			return { ...state, settings: { ...state.settings, isSessionTimeout: action.payload.isSessionTimeout } };
		case 'updateNonce':
			return {
				...state,
				nonces: [...state.nonces.filter(({ chain }) => chain !== action.payload.chain), action.payload],
			};
		default:
			return state;
	}
};
