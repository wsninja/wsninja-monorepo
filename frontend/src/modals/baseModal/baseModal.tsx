import React, { FC, MouseEvent, ReactNode, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';

type IModalAnimation = 'fadeIn' | 'fadeOut';

const fadeInKeyframes = keyframes`
	from{
		opacity: 0;
	}

	to{
		opacity: 1;
	}
`;

const fadeOutKeyframes = keyframes`
	from{
		opacity: 1;
	}

	to{
		opacity: 0;
	}
`;

const fadeInAnimation = css`
	animation: ${fadeInKeyframes} 0.25s linear;
`;

const fadeOutAnimation = css`
	opacity: 0;
	animation: ${fadeOutKeyframes} 0.25s linear;
`;

const Background = styled.div<{ animation?: IModalAnimation }>`
	display: flex;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${({ theme }) => (theme.isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(64, 64, 64, 0.5)')};
	align-items: center;
	justify-content: center;
	${({ animation }) => (animation === 'fadeIn' ? fadeInAnimation : animation === 'fadeOut' ? fadeOutAnimation : '')}
`;

const ModalWrapper = styled.div`
	display: flex;
	max-width: 100vw;
`;

interface IBaseModalProps {
	children?: ReactNode;
	className?: string;
	animation?: IModalAnimation;
	onClose: () => void;
}

export const BaseModal: FC<IBaseModalProps> = ({ children, className, animation, onClose }) => {
	const modalRoot = useMemo(() => document.getElementById('modal-root'), []);

	const handlePropagation = useCallback((event: MouseEvent<HTMLDivElement>) => event.stopPropagation(), []);

	if (!modalRoot) {
		return null;
	}

	return createPortal(
		<Background className={className} animation={animation} onClick={onClose}>
			<ModalWrapper onClick={handlePropagation}>{children}</ModalWrapper>
		</Background>,
		modalRoot
	);
};
