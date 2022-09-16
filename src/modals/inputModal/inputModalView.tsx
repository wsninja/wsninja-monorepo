import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Input } from 'components/form/input/input';
import { QrCodeScanner } from 'components/qrCodeScanner/qrCodeScanner';
import { BaseModal } from 'modals/baseModal/baseModal';
import { ChangeEvent, FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import styled from 'styled-components';

const ModalContainer = styled(Col)`
	border-radius: 4px;
`;

const StyledQrCodeScanner = styled(QrCodeScanner)`
	max-width: 80vw;
`;

interface IInputModalViewProps {
	onClose: () => void;
	text: string;
	value: string;
	onChangeValue: (value: string) => void;
	onSubmit: () => void;
	qrCode: string;
	onScan: (qrCode: string) => void;
}

export const InputModalView: FC<IInputModalViewProps> = ({
	onClose,
	text,
	value,
	onChangeValue,
	onSubmit,
	qrCode,
	onScan,
}) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const handleChangeValue = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChangeValue(event.target.value);
		},
		[onChangeValue]
	);

	return (
		<BaseModal onClose={onClose}>
			<ModalContainer backgroundColor="primaryBackground" horizontalPadding="m" verticalPadding="m" gap="m">
				{text}
				<Input placeholder="" type="text" value={value} onChange={handleChangeValue} />
				<TextButton type="primary" text="Confirm" onClick={onSubmit} />
				{qrCode ? qrCode : <StyledQrCodeScanner onSubmit={onScan} />}
			</ModalContainer>
		</BaseModal>
	);
};
