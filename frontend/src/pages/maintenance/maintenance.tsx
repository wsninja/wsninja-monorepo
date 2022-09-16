import { errorToast, messageToast } from 'components/utils';
import { MaintenanceView } from 'pages/maintenance/maintenanceView';
import { ChangeEvent, Component } from 'react';
import { getDatabase, setDatabase } from 'utils/api/maintenance/maintenance';
import { arrayBufferToString, errorToString } from 'utils/utils';

interface IMaintenanceState {
	password: string;
}

export class Maintenance extends Component<{}, IMaintenanceState> {
	state: IMaintenanceState = {
		password: '',
	};

	handleChangePassword = (password: string) => {
		this.setState({ password });
	};

	handleDownload = async () => {
		const { password } = this.state;
		try {
			const { file: base64File } = await getDatabase({
				password,
			});
			const content = Buffer.from(base64File, 'base64');
			const element = document.createElement('a');
			const file = new Blob([content], {
				type: 'text/plain',
			});
			element.href = URL.createObjectURL(file);
			element.download = `${new Date().toISOString()}_wsn.sq3`;
			document.body.appendChild(element);
			element.click();
		} catch (e) {
			errorToast(errorToString(e));
		}
	};

	handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener('load', async (event) => {
				const { password } = this.state;
				try {
					if (event.target?.result) {
						const newKey =
							event.target.result instanceof ArrayBuffer
								? arrayBufferToString(event.target.result)
								: event.target.result;
						const matches = newKey.match(/(?:data:.*;base64,)(.*)/);
						if (matches) {
							messageToast('Uploading database. This may take some time.');
							await setDatabase({ password, file: matches[1] });
							messageToast('Database uploaded.');
						}
					}
				} catch (e) {
					errorToast(errorToString(e));
				}
			});
			reader.readAsDataURL(event.target.files[0]);
		}
	};

	render() {
		const { password } = this.state;

		return (
			<MaintenanceView
				password={password}
				onChangePassword={this.handleChangePassword}
				onDownload={this.handleDownload}
				onUpload={this.handleUpload}
			/>
		);
	}
}
