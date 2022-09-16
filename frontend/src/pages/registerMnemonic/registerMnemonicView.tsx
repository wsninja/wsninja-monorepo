import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { toPx } from 'components/flex/utils';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { Icon } from 'components/icon/icon';
import { PageCard } from 'components/pageCard/pageCard';
import { Text } from 'components/text/text';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import styled, { useTheme } from 'styled-components';
import { useDevice } from 'utils/useDevice';

const ExtButton = styled(TextButton)`
	flex: 1;

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		max-width: 220px;
	}
`;

const MnemonicContainer = styled(Col)`
	position: relative;
	border-radius: 8px;
	overflow: hidden;
`;

const MnemonicCover = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${({ theme }) => (theme.isLight ? theme.color.lightGray : theme.color.gray)};
	opacity: 0.9;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;

const Highlight = styled.span`
	color: ${({ theme }) => theme.color.red};
`;

interface IRegisterMnemonicViewProps {
	mnemonic: string;
	hideMnemonic: boolean;
	onShowMnemonic: () => void;
	onBack: () => void;
	onSubmit: () => void;
}

export const RegisterMnemonicView: FC<IRegisterMnemonicViewProps> = ({
	mnemonic,
	hideMnemonic,
	onShowMnemonic,
	onBack,
	onSubmit,
}) => {
	const { isDesktop, isMobile } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const {
		color: { primaryText },
	} = useTheme();

	return (
		<HomeLayout>
			<PageCard direction="column">
				<Col gap="m">
					<Row justifyContent={isDesktop ? 'center' : undefined}>
						<Text fontSize="xl" mobileFontSize="l" fontWeight="bold" color="primary">
							Secret Recovery Phrase
						</Text>
					</Row>
					<Text fontSize="m">Your Secret Recovery Phrase makes it easy to back up and restore your account</Text>
					<Text fontSize="m">
						<Highlight>WARNING:</Highlight> Never disclose your Secret Recovery Phrase. Anyone with this phrase can take
						your account forever! Do not loose your Secret Recovery Phrase!
					</Text>
					<MnemonicContainer horizontalPadding={isDesktop ? 80 : 40} verticalPadding="xxl">
						<Text fontSize="l" textAlign={isMobile ? 'center' : undefined}>
							{mnemonic}
						</Text>
						{hideMnemonic && (
							<MnemonicCover onClick={onShowMnemonic}>
								<Icon name="lock" color={isDarkTheme ? primaryText : undefined} />
								<Text fontSize="l" mobileFontSize="m" textAlign="center">
									Click here to reveal phrase
								</Text>
							</MnemonicCover>
						)}
					</MnemonicContainer>
					{isDesktop ? (
						<Row gap="m">
							<ExtButton type="secondary" text="Back" onClick={onBack} />
							<ExtButton type="primary" text="I wrote it down" onClick={onSubmit} />
						</Row>
					) : (
						<Row justifyContent="center">
							<ExtButton type="primary" size="s" text="I wrote it down" onClick={onSubmit} />
						</Row>
					)}
				</Col>
			</PageCard>
		</HomeLayout>
	);
};
