import { InputModalView } from 'modals/inputModal/inputModalView';
import QrCodeReader from 'qrcode-reader';
import { Component } from 'react';

interface IInputModalProps {
	text: string;
	onClose: () => void;
	onSubmit: (value: string) => void;
}

interface IInputModalState {
	qrCodeReader: any;
	value: string;
	qrCode: string;
}

export class InputModal extends Component<IInputModalProps, IInputModalState> {
	constructor(props: IInputModalProps) {
		super(props);
		this.state = {
			qrCodeReader: new QrCodeReader(),
			value: '',
			qrCode: '',
		};
	}

	handleSubmit = () => {
		const { value } = this.state;
		this.props.onSubmit(value);
	};

	handleChangeValue = (value: string) => {
		this.setState({ value });
	};

	handleScan = (qrCode: string) => {
		this.setState({ qrCode });
	};

	render() {
		const { text } = this.props;
		const { value, qrCode } = this.state;

		return (
			<InputModalView
				onClose={this.props.onClose}
				text={text}
				value={value}
				onChangeValue={this.handleChangeValue}
				onSubmit={this.handleSubmit}
				qrCode={qrCode}
				onScan={this.handleScan}
			/>
		);
	}
}
