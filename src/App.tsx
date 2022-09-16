import { IdleTimer } from 'components/idleTimer/idleTimer';
import { Loader } from 'components/loader/loader';
import { ProtectedRoute } from 'components/protectedRoute/protectedRoute';
import { WalletConnectHandler } from 'components/walletConnectHandler/walletConnectHandler';
import { Apps } from 'pages/apps/apps';
import { Artworks } from 'pages/artworks/artworks';
import { ConfirmMnemonic } from 'pages/confirmMnemonic/confirmMnemonic';
import { DashboardHome } from 'pages/dashboardHome/dashboardHome';
import { DownloadKey } from 'pages/downloadKey/downloadKey';
import { Exchange } from 'pages/exchange/exchange';
import { Home } from 'pages/home/home';
import { Login } from 'pages/login/login';
import { Maintenance } from 'pages/maintenance/maintenance';
import { Notifications } from 'pages/notifications/notifications';
import { Register } from 'pages/register/register';
import { RegisterMnemonic } from 'pages/registerMnemonic/registerMnemonic';
import { RestoreAccount } from 'pages/restoreAccount/restoreAccount';
import { RestoreKeyfile } from 'pages/restoreKeyfile/restoreKeyfile';
import { RestoreMnemonic } from 'pages/restoreMnemonic/restoreMnemonic';
import { RestorePasswordKeyfile } from 'pages/restorePasswordKeyfile/restorePasswordKeyfile';
import { RestorePasswordMnemonic } from 'pages/restorePasswordMnemonic/restorePasswordMnemonic';
import { Settings } from 'pages/settings/settings';
import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateChainCoinPrice } from 'store/network/actions';
import { IDispatch, IRootState } from 'store/store';
import { updateSwapTokens } from 'store/swap/actions';
import { updateAskPasswordOnTransaction, updateIsSessionTimeout } from 'store/user/actions';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from 'styles/darkTheme';
import { lightTheme } from 'styles/lightTheme';
import { IChain, ISwapToken } from 'types';
import { getBalances, getChainCoinPrice, getSwapTokens, getUserSettings } from 'utils/api/api';
import { getEthereumKeys } from 'utils/crypto';
import { getNotifications } from 'utils/notification';
import { getChainId, isEthereumChain } from 'utils/utils';

const Wallet = lazy(() => import('./pages/wallet/wallet').then(({ Wallet }) => Promise.resolve({ default: Wallet })));
const Coin = lazy(() => import('./pages/coin/coin').then(({ Coin }) => Promise.resolve({ default: Coin })));
const Watchlist = lazy(() =>
	import('./pages/watchlist/watchlist').then(({ Watchlist }) => Promise.resolve({ default: Watchlist }))
);

interface IAppProps {
	isDarkTheme: boolean;
	tokens: Array<ISwapToken>;
	chain: IChain;
	mnemonic: string;
	isAuthenticated: boolean;
	securityToken: string;
	updateSwapTokens: (tokens: Array<ISwapToken>) => void;
	updateChainCoinPrice: (chainCoinPrice: number, chainCoinPriceTimestamp: number) => void;
	updateAskPasswordOnTransaction: (askPasswordOnTransaction: boolean) => void;
	updateIsSessionTimeout: (isSessionTimeout: boolean) => void;
}

class App extends Component<IAppProps> {
	async componentDidMount() {
		const tokens = await getSwapTokens();
		this.props.updateSwapTokens(tokens);
		await this.updateChainCoinPrice();
		await this.updateNotifications();
		await this.updateUserSettings();
	}

	async componentDidUpdate(prevProps: IAppProps) {
		const { chain, tokens, mnemonic, isAuthenticated } = this.props;
		if (prevProps.chain !== chain || prevProps.tokens.length !== tokens.length || prevProps.mnemonic !== mnemonic) {
			await this.updateBalances(prevProps.mnemonic !== mnemonic);
		}
		if (prevProps.chain !== chain) {
			await this.updateChainCoinPrice();
		}
		if (prevProps.isAuthenticated !== isAuthenticated) {
			await this.updateNotifications();
		}
	}

	updateBalances = async (reset: boolean) => {
		const { chain, isAuthenticated, tokens, mnemonic } = this.props;
		if (isAuthenticated && isEthereumChain(chain)) {
			const chainId = getChainId(chain);
			const { address } = getEthereumKeys(mnemonic);
			const balances = await getBalances(chainId, address);
			const newTokens = tokens.map((token) => {
				if (token.chainId === chainId) {
					let balance = '0';
					const balanceData = balances.find(
						(balance) => balance.tokenAddress.toLowerCase() === token.address.toLowerCase()
					);
					if (balanceData) {
						balance = balanceData.balance;
					}
					return { ...token, balance };
				} else if (reset) {
					return { ...token, balance: '0' };
				}
				return token;
			});
			this.props.updateSwapTokens(newTokens);
		}
	};

	updateChainCoinPrice = async () => {
		const { chain } = this.props;
		if (isEthereumChain(chain)) {
			const timestamp = Date.now();
			const chainCoinPrice = await getChainCoinPrice(getChainId(chain));
			this.props.updateChainCoinPrice(chainCoinPrice, timestamp);
		}
	};

	updateNotifications = async () => {
		const { isAuthenticated, securityToken } = this.props;
		if (isAuthenticated && securityToken) {
			await getNotifications(securityToken);
		}
	};

	updateUserSettings = async () => {
		const { isAuthenticated, securityToken } = this.props;
		if (isAuthenticated && securityToken) {
			const { askPasswordOnTransaction, isSessionTimeout } = await getUserSettings(securityToken);
			this.props.updateAskPasswordOnTransaction(askPasswordOnTransaction);
			this.props.updateIsSessionTimeout(isSessionTimeout);
		}
	};

	render() {
		const { isDarkTheme } = this.props;

		return (
			<ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
				<Router>
					<Switch>
						<Suspense fallback={<Loader />}>
							<Route exact path="/" component={Home} />
							<Route exact path="/login" component={Login} />
							<Route exact path="/register" component={Register} />
							<Route exact path="/registerMnemonic" component={RegisterMnemonic} />
							<Route exact path="/confirmMnemonic" component={ConfirmMnemonic} />
							<Route exact path="/restore-account" component={RestoreAccount} />
							<Route exact path="/restore-password-keyfile" component={RestorePasswordKeyfile} />
							<Route exact path="/restore-password-passphrase" component={RestorePasswordMnemonic} />
							<Route exact path="/restore-keyfile" component={RestoreKeyfile} />
							<Route exact path="/restore-passphrase" component={RestoreMnemonic} />
							<Route exact path="/maintenance" component={Maintenance} />
							<ProtectedRoute exact path="/download-key" component={DownloadKey} />
							<ProtectedRoute exact path="/home" component={DashboardHome} />
							<ProtectedRoute exact path="/notifications" component={Notifications} />
							<ProtectedRoute exact path="/notifications/:notificationId" component={Notifications} />
							<ProtectedRoute exact path="/apps" component={Apps} />
							<ProtectedRoute exact path="/settings" component={Settings} />
							<ProtectedRoute exact path="/wallet/:tab?" component={Wallet} />
							<ProtectedRoute exact path="/artworks/:artworkId?" component={Artworks} />
							<ProtectedRoute exact path="/coin/:tokenHash/:transactionHash?" component={Coin} />
							<ProtectedRoute exact path="/watchlist" component={Watchlist} />
							<ProtectedRoute exact path="/exchange" component={Exchange} />
							{/* <Redirect path="/" to="/" /> */}
						</Suspense>
					</Switch>
					<WalletConnectHandler />
					<div id="modal-root" />
					<ToastContainer
						position="top-right"
						autoClose={3000}
						hideProgressBar={true}
						newestOnTop={true}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						pauseOnHover
						className={isDarkTheme ? 'ToastDark' : undefined}
					/>
				</Router>
				<IdleTimer />
			</ThemeProvider>
		);
	}
}

const mapStateToProps = ({
	theme: { isDarkTheme },
	swap: { tokens },
	network: { chain },
	user: { mnemonic, isAuthenticated, securityToken },
}: IRootState) => ({ isDarkTheme, tokens, chain, mnemonic, isAuthenticated, securityToken });

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateSwapTokens: (tokens: Array<ISwapToken>) => dispatch(updateSwapTokens(tokens)),
	updateChainCoinPrice: (chainCoinPrice: number, chainCoinPriceTimestamp: number) =>
		dispatch(updateChainCoinPrice(chainCoinPrice, chainCoinPriceTimestamp)),
	updateAskPasswordOnTransaction: (askPasswordOnTransaction: boolean) =>
		dispatch(updateAskPasswordOnTransaction(askPasswordOnTransaction)),
	updateIsSessionTimeout: (isSessionTimeout: boolean) => dispatch(updateIsSessionTimeout(isSessionTimeout)),
});

const app = connect(mapStateToProps, mapDispatchToProps)(App);

export { app as App };
