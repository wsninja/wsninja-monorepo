import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Input } from 'components/form/input/input';
import { messageToast } from 'components/utils';
import { BaseModal } from 'modals/baseModal/baseModal';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import styled from 'styled-components';
import { decrypt } from 'utils/crypto';

const ModalContainer = styled(Col)`
	border-radius: 4px;
`;

interface IPasswordModalProps {
	onClose: () => void;
	onConfirm: () => void;
}

export const PasswordModal: FC<IPasswordModalProps> = ({ onClose, onConfirm }) => {
	const { encryptedMnemonic, mnemonic } = useSelector((state: IRootState) => state.user);
	const [password, setPassword] = useState('');

	const handleSubmit = useCallback(() => {
		const mnemonic2 = decrypt(encryptedMnemonic, password);
		if (mnemonic === mnemonic2) {
			onConfirm();
		} else {
			messageToast('Wrong password');
		}
	}, [encryptedMnemonic, password, onConfirm, mnemonic]);

	const handleChangePassword = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	}, []);

	return (
		<BaseModal onClose={onClose}>
			<ModalContainer backgroundColor="primaryBackground" horizontalPadding="m" verticalPadding="m" gap="m">
				Please confirm your password
				<Input placeholder="Password" type="password" value={password} onChange={handleChangePassword} />
				<TextButton type="primary" text="Confirm" onClick={handleSubmit} />
			</ModalContainer>
		</BaseModal>
	);
};
