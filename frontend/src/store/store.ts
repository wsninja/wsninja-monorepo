import { Action, combineReducers, ThunkAction } from '@reduxjs/toolkit';
import { parse, stringify } from '@softstack/typed-stringify';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import conversionsReducer, { IConversionsState, initialConversionsState } from 'store/conversions/conversions';
import { initialNetworkState, networkReducer } from 'store/network/reducer';
import { INetworkState } from 'store/network/types';
import { initialNotificationState, notificationReducer } from 'store/notification/reducer';
import { INotificationState } from 'store/notification/types';
import { initialSwapState, swapReducer } from 'store/swap/reducer';
import { ISwapState } from 'store/swap/types';
import { initialThemeState, IThemeState, themeReducer } from 'store/theme/theme';
import { DeepPartial, IActionType } from 'store/types';
import { initialUserState, userReducer } from 'store/user/reducer';
import { IUserState } from 'store/user/types';
import { initialWalletState, walletReducer } from 'store/wallet/reducer';
import { IWalletState } from 'store/wallet/types';
import { initialWalletConnectState, walletConnectReducer } from 'store/walletConnect/reducer';
import { IWalletConnectState } from 'store/walletConnect/types';
import { mergeDeep } from 'utils/utils';

interface IState {
	theme: IThemeState;
	user: IUserState;
	conversions: IConversionsState;
	notification: INotificationState;
	network: INetworkState;
	swap: ISwapState;
	wallet: IWalletState;
	walletConnect: IWalletConnectState;
}

const rootReducer = combineReducers({
	theme: themeReducer,
	user: userReducer,
	conversions: conversionsReducer,
	notification: notificationReducer,
	network: networkReducer,
	swap: swapReducer,
	wallet: walletReducer,
	walletConnect: walletConnectReducer,
});

const storageKey = 'e2019bc4782beb3dd00fa7a246e5e215b9ab743cbf98a00d725bce11aa525ff7';

const saveLocalState = (state: IState) => {
	const {
		theme,
		user: { encryptedMnemonic },
		network: { chain },
	} = state;
	const localState: DeepPartial<IState> = { theme, user: { encryptedMnemonic }, network: { chain } };
	localStorage.setItem(storageKey, stringify<DeepPartial<IState>>(localState));
};

const loadLocalState = (): DeepPartial<IState> | undefined => {
	const serialisedState = localStorage.getItem(storageKey);
	if (serialisedState) {
		const state: DeepPartial<IState> = parse(serialisedState) as DeepPartial<IState>;
		return state;
	}
	return undefined;
};

const saveSessionState = (state: IState) => {
	const {
		user: { isAuthenticated, mnemonic, encryptedMnemonic, securityToken, password },
	} = state;
	const sessionState: DeepPartial<IState> = {
		user: { isAuthenticated, mnemonic, encryptedMnemonic, securityToken, password },
	};
	sessionStorage.setItem(storageKey, stringify<DeepPartial<IState>>(sessionState));
};

const loadSessionState = (): DeepPartial<IState> | undefined => {
	const serialisedState = sessionStorage.getItem(storageKey);
	if (serialisedState) {
		const state: DeepPartial<IState> = parse(serialisedState) as DeepPartial<IState>;
		return state;
	}
	return undefined;
};

const loadState = (): Partial<IState> => {
	const initialState: IState = {
		theme: initialThemeState,
		user: initialUserState,
		conversions: initialConversionsState,
		notification: initialNotificationState,
		network: initialNetworkState,
		swap: initialSwapState,
		wallet: initialWalletState,
		walletConnect: initialWalletConnectState,
	};
	return mergeDeep(initialState, mergeDeep(loadLocalState(), loadSessionState())) as Partial<IState>;
};

const middleware = applyMiddleware(thunkMiddleware);

export const store = createStore(rootReducer, loadState(), middleware);

store.subscribe(() => {
	saveSessionState(store.getState());
	saveLocalState(store.getState());
});

export type IRootState = ReturnType<typeof rootReducer>;

export type IThunkResult<R> = ThunkAction<Promise<R>, IRootState, unknown, Action<IActionType>>;

interface IThunkDispatch<TState, TExtraThunkArg, TBasicAction extends Action> {
	<TReturnType>(thunkAction: ThunkAction<TReturnType, TState, TExtraThunkArg, TBasicAction>): TReturnType;
	<A extends TBasicAction>(action: A): A;
	// This overload is the union of the two above (see TS issue #14107).
	<TReturnType, TAction extends TBasicAction>(
		action: TAction | ThunkAction<TReturnType, TState, TExtraThunkArg, TBasicAction>
	): TAction | TReturnType;
}

export type IDispatch = IThunkDispatch<IRootState, undefined, Action<IActionType>>;
