import { Icon } from 'components/icon/icon';
import { BaseModal } from 'modals/baseModal/baseModal';
import React, { FC, ReactNode } from 'react';
import './Modal.scss';

interface IModalProps {
	children?: ReactNode;
	isOpen: boolean;
	heading: string;
	close: () => void;
}

export const Modal: FC<IModalProps> = ({ children, isOpen, heading, close }) => {
	if (!isOpen) {
		return null;
	}
	return (
		<BaseModal onClose={close}>
			<div className="Modal__content">
				<div className="Modal__header">
					<span className="Modal__header-heading">{heading}</span>
					<Icon className="Modal__header-close" name="close" onClick={close} />
				</div>
				<div className="Modal__body">{children}</div>
			</div>
		</BaseModal>
	);
};
