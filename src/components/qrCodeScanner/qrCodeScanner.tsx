import { QrCodeScannerView } from 'components/qrCodeScanner/qrCodeScannerView';
import { uniqueId } from 'lodash';
import QrCodeReader from 'qrcode-reader';
import { Component } from 'react';

interface IQrCodeScannerProps {
	className?: string;
	onSubmit: (qrCode: string) => void;
}

interface IQrCodeScannerState {
	scanning: boolean;
	qrCode: string;
}

export class QrCodeScanner extends Component<IQrCodeScannerProps, IQrCodeScannerState> {
	readonly canvasElementId = uniqueId('QrCodeScanner-canvasElementId-');
	readonly videoElementId = uniqueId('QrCodeScanner-videoElementId-');
	readonly qrCodeReader = new QrCodeReader();

	constructor(props: IQrCodeScannerProps) {
		super(props);
		this.state = {
			scanning: false,
			qrCode: '',
		};
	}

	componentDidMount() {
		const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement | null;
		if (videoElement) {
			this.qrCodeReader.callback = (error: any, value: any) => {
				if (value) {
					this.setState({ qrCode: value.result, scanning: false });
					this.props.onSubmit(value.result);
					(videoElement.srcObject as any).getTracks().forEach((track: any) => {
						track.stop();
					});
				}
			};

			navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then((stream) => {
				videoElement.srcObject = stream;
				videoElement.play();
				this.setState({ scanning: true });
			});
		}
	}

	componentDidUpdate(prevProps: IQrCodeScannerProps, prevState: IQrCodeScannerState) {
		const { scanning } = this.state;
		if (prevState.scanning !== scanning && scanning) {
			this.tick();
			this.scan();
		}
	}

	tick = () => {
		const { scanning } = this.state;
		const canvasElement = document.getElementById(this.canvasElementId) as HTMLCanvasElement | null;
		const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement | null;
		if (canvasElement && videoElement) {
			const canvas = canvasElement.getContext('2d');
			if (canvas) {
				canvasElement.height = videoElement.videoHeight;
				canvasElement.width = videoElement.videoWidth;
				canvas.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
				scanning && requestAnimationFrame(this.tick);
			}
		}
	};

	scan = () => {
		const { qrCode } = this.state;
		try {
			if (!qrCode) {
				const canvasElement = document.getElementById(this.canvasElementId) as HTMLCanvasElement | null;
				if (canvasElement) {
					const canvas = canvasElement.getContext('2d');
					if (canvas) {
						const width = canvasElement.getBoundingClientRect().width;
						const height = canvasElement.getBoundingClientRect().height;
						if (width > 0 && height > 0) {
							const data = canvas.getImageData(0, 0, width, height);
							this.qrCodeReader.decode(data);
						}
					}
				}
			}
		} finally {
			setTimeout(this.scan, 300);
		}
	};

	render() {
		const { className } = this.props;

		return (
			<QrCodeScannerView
				className={className}
				canvasElementId={this.canvasElementId}
				videoElementId={this.videoElementId}
			/>
		);
	}
}
