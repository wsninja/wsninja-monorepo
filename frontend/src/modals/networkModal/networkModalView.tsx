import { BaseButton } from 'components/button/baseButton';
import { Col } from 'components/flex/col';
import { toPx } from 'components/flex/utils';
import { networks } from 'constants/networks';
import { BaseModal } from 'modals/baseModal/baseModal';
import { FC } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { IChain } from 'types';
import { useDevice } from 'utils/useDevice';

const Absolute = styled(Col)<{ x: number; y: number }>`
	position: absolute;
	left: ${({ x }) => toPx(x)};
	top: ${({ y }) => toPx(y)};
	transform: translateX(-100%);
`;

const MenuContainer = styled(Col)`
	border-radius: 4px;
	overflow: hidden;
	opacity: 1;
`;

const BannerButton = styled(BaseButton)`
	padding-top: ${({ theme }) => toPx(theme.distance.s)};
	padding-bottom: ${({ theme }) => toPx(theme.distance.s)};
	padding-left: ${({ theme }) => toPx(theme.distance.l)};
	padding-right: ${({ theme }) => toPx(theme.distance.l)};

	:hover {
		background-color: ${({ theme }) => theme.color.ultraGray};

		.banner {
			filter: ${({ theme }) => (theme.isDark ? 'opacity(100%) grayscale(100%) brightness(0%)' : undefined)};
		}
	}
`;

const Banner = styled.img`
	height: 24px;
	filter: ${({ theme }) => (theme.isDark ? 'opacity(100%) grayscale(100%) brightness(0%) invert()' : undefined)};
`;

const moveIn = keyframes`
  from {
    transform: translateX(100%)
  }

  to {
    transform: translateX(0%);
  }
`;

const moveOut = keyframes`
	from {
    transform: translateX(0%);
  }
	
	to {
    transform: translateX(100%);
  }
`;

const moveInAnimation = css`
	animation: ${moveIn} 0.25s linear;
`;

const moveOutAnimation = css`
	animation: ${moveOut} 0.25s linear;
`;

const Move = styled.div<{ animation: 'moveIn' | 'moveOut' }>`
	display: flex;
	flex-direction: column;
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	justify-content: center;
	animation: ${moveIn} 0.25s linear;
	${({ animation }) => (animation === 'moveIn' ? moveInAnimation : animation === 'moveOut' ? moveOutAnimation : '')}
`;

interface INetworkModalViewProps {
	fadeOut: boolean;
	x: number;
	y: number;
	onClose: () => void;
	onChange: (chain: IChain) => void;
}

export const NetworkModalView: FC<INetworkModalViewProps> = ({ fadeOut, x, y, onClose, onChange }) => {
	const { isDesktop, isMobile } = useDevice();

	return (
		<BaseModal animation={isMobile ? (fadeOut ? 'fadeOut' : 'fadeIn') : undefined} onClose={onClose}>
			{isDesktop ? (
				<Absolute x={x} y={y}>
					<MenuContainer backgroundColor="primaryBackground">
						{networks.map(({ chain, banner }) => (
							<BannerButton key={chain} onClick={() => onChange(chain)}>
								<Banner className="banner" src={banner} />
							</BannerButton>
						))}
					</MenuContainer>
				</Absolute>
			) : (
				<Move animation={fadeOut ? 'moveOut' : 'moveIn'}>
					<MenuContainer backgroundColor="primaryBackground">
						{networks.map(({ chain, banner }) => (
							<BannerButton key={chain} onClick={() => onChange(chain)}>
								<Banner className="banner" src={banner} />
							</BannerButton>
						))}
					</MenuContainer>
				</Move>
			)}
		</BaseModal>
	);
};
