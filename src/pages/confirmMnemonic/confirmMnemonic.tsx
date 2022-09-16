import { ConfirmMnemonicView } from 'pages/confirmMnemonic/confirmMnemonicView';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IDispatch, IRootState } from 'store/store';
import { login } from 'store/user/actions';
import { addUser, addWalletTokensToCustomTokens, getUserSettings } from 'utils/api/api';
import { encrypt, getEthereumKeys } from 'utils/crypto';

interface IConfirmMnemonicProps extends RouteComponentProps {
	password: string;
	mnemonic: string;
	login: (
		mnemonic: string,
		encryptedMnemonic: string,
		securityToken: string,
		settings: {
			askPasswordOnTransaction: boolean;
			isSessionTimeout: boolean;
		}
	) => void;
}

interface IConfirmMnemonicState {
	randomisedWords: Array<string>;
	selectedWords: Array<string>;
	isCorrect: boolean;
}

class ConfirmMnemonic extends Component<IConfirmMnemonicProps, IConfirmMnemonicState> {
	constructor(props: IConfirmMnemonicProps) {
		super(props);
		const { mnemonic } = props;
		const randomisedWords = mnemonic.split(' ');
		for (let i = 0; randomisedWords.length > i; i++) {
			const randomIndex = Math.floor(Math.random() * randomisedWords.length);
			const tmp = randomisedWords[i];
			randomisedWords[i] = randomisedWords[randomIndex];
			randomisedWords[randomIndex] = tmp;
		}
		this.state = {
			selectedWords: [],
			randomisedWords,
			isCorrect: false,
		};
	}

	componentDidUpdate(prevProps: IConfirmMnemonicProps, prevState: IConfirmMnemonicState) {
		const { selectedWords } = this.state;
		if (prevState.selectedWords !== selectedWords) {
			this.updateIsCorrect();
		}
	}

	updateIsCorrect = () => {
		const { mnemonic } = this.props;
		const { selectedWords } = this.state;
		const words = mnemonic.split(' ');
		if (selectedWords.length === words.length) {
			let equal = true;
			for (let i = 0; words.length > i; i++) {
				if (selectedWords[i] !== words[i]) {
					equal = false;
				}
			}
			if (equal) {
				this.setState({ isCorrect: true });
				return;
			}
		}
		this.setState({ isCorrect: false });
	};

	handleSelectWord = (word: string) => {
		const { selectedWords } = this.state;
		this.setState({ selectedWords: [...selectedWords, word] });
	};

	handleDeselectWord = (word: string) => {
		const { selectedWords } = this.state;
		this.setState({ selectedWords: selectedWords.filter((selectedWord) => selectedWord !== word) });
	};

	handleSubmit = async () => {
		const { mnemonic, password } = this.props;
		const encryptedMnemonic = encrypt(mnemonic, password);
		const { privateKey } = getEthereumKeys(mnemonic);
		const { securityToken, newUser } = await addUser(privateKey);
		if (newUser) {
			await addWalletTokensToCustomTokens(securityToken);
		}
		const { askPasswordOnTransaction, isSessionTimeout } = await getUserSettings(securityToken);
		this.props.login(mnemonic, encryptedMnemonic, securityToken, {
			askPasswordOnTransaction,
			isSessionTimeout,
		});
		this.props.history.push('/download-key');
	};

	render() {
		const { selectedWords, randomisedWords, isCorrect } = this.state;
		return (
			<ConfirmMnemonicView
				randomisedWords={randomisedWords}
				selectedWords={selectedWords}
				isCorrect={isCorrect}
				onSelectWord={this.handleSelectWord}
				onDeselectWord={this.handleDeselectWord}
				onSubmit={this.handleSubmit}
			/>
		);
	}

	componentDidMount() {
		const { password, mnemonic } = this.props;
		if (!password || !mnemonic) {
			this.props.history.push('/register');
		}
	}
}

const mapStateToProps = ({ user: { password, mnemonic } }: IRootState) => ({
	password,
	mnemonic,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	login: (
		mnemonic: string,
		encryptedMnemonic: string,
		securityToken: string,
		settings: {
			askPasswordOnTransaction: boolean;
			isSessionTimeout: boolean;
		}
	) => dispatch(login(mnemonic, encryptedMnemonic, securityToken, settings)),
});

const confirmMnemonic = connect(mapStateToProps, mapDispatchToProps)(withRouter(ConfirmMnemonic));

export { confirmMnemonic as ConfirmMnemonic };
