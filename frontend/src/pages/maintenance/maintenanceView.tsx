import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Input } from 'components/form/input/input';
import { uniqueId } from 'lodash';
import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const Main = styled(Col)`
	max-width: 500px;
	min-height: 100vh;
`;

const FileInput = styled.input`
	display: none;
`;

interface IMaintenanceViewProps {
	password: string;
	onChangePassword: (password: string) => void;
	onDownload: () => void;
	onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const MaintenanceView: FC<IMaintenanceViewProps> = ({ password, onChangePassword, onDownload, onUpload }) => {
	const fileInputElementId = useMemo(() => uniqueId('file-input-'), []);

	const handleChangePassword = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChangePassword(event.target.value);
		},
		[onChangePassword]
	);

	const handleClickUploadFile = useCallback(() => {
		const fileInputElement = document.getElementById(fileInputElementId);
		if (fileInputElement) {
			fileInputElement.click();
		}
	}, [fileInputElementId]);

	return (
		<Col alignItems="center">
			<Main justifyContent="center">
				<Col gap="m">
					<Input type="password" placeholder="Password" value={password} onChange={handleChangePassword} />
					<TextButton type="primary" text="Download Database" onClick={onDownload} size="s" />
					<FileInput type="file" id={fileInputElementId} onChange={onUpload} />
					<TextButton type="primary" text="Upload Database" onClick={handleClickUploadFile} size="s" />
				</Col>
			</Main>
		</Col>
	);
};
