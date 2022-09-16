import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { messageToast } from 'components/utils';
import { RegisterMnemonicView } from 'pages/registerMnemonic/registerMnemonicView';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IDispatch, IRootState } from 'store/store';
import { updateMnemonic } from 'store/user/actions';

interface IRegisterMnemonicProps extends RouteComponentProps {
	password: string;
	updateMnemonic: (mnemonic: string) => void;
}

interface IRegisterMnemonicState {
	mnemonic: string;
	hideMnemonic: boolean;
}

class RegisterMnemonic extends Component<IRegisterMnemonicProps, IRegisterMnemonicState> {
	constructor(props: IRegisterMnemonicProps) {
		super(props);

		this.state = {
			mnemonic: generateMnemonic(wordlist),
			hideMnemonic: true,
		};
	}

	componentDidMount() {
		const { password } = this.props;
		if (!password) {
			this.props.history.push('/register');
		}
	}

	handleShowMnemonic = () => {
		this.setState({ hideMnemonic: false });
	};

	handleBack = () => {
		this.props.history.goBack();
	};

	handleSubmit = () => {
		const { hideMnemonic, mnemonic } = this.state;
		if (hideMnemonic) {
			messageToast('Please reveal and write down Secret Recovery Phrase first');
		}
		if (!hideMnemonic) {
			this.props.updateMnemonic(mnemonic);
			this.props.history.push('/confirmMnemonic');
		}
	};

	render() {
		const { mnemonic, hideMnemonic } = this.state;
		return (
			<RegisterMnemonicView
				mnemonic={mnemonic}
				hideMnemonic={hideMnemonic}
				onShowMnemonic={this.handleShowMnemonic}
				onBack={this.handleBack}
				onSubmit={this.handleSubmit}
			/>
		);
	}
}

const mapStateToProps = ({ user: { password } }: IRootState) => ({
	password,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateMnemonic: (mnemonic: string) => dispatch(updateMnemonic(mnemonic)),
});

const registerMnemonic = connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterMnemonic));

export { registerMnemonic as RegisterMnemonic };
