import { RestoreAccountView } from 'pages/restoreAccount/restoreAccountView';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface IRestoreAccountProps extends RouteComponentProps {}

class RestoreAccount extends Component<IRestoreAccountProps> {
	handleKeyfile = () => {
		this.props.history.push('/restore-password-keyfile');
	};

	handleMnemonic = () => {
		this.props.history.push('/restore-password-passphrase');
	};

	render() {
		return <RestoreAccountView onKeyfile={this.handleKeyfile} onMnemonic={this.handleMnemonic} />;
	}
}

const restoreAccount = withRouter(RestoreAccount);

export { restoreAccount as RestoreAccount };
