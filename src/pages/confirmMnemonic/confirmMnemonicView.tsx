import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { toPx } from 'components/flex/utils';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { PageCard } from 'components/pageCard/pageCard';
import { Text } from 'components/text/text';
import { FC } from 'react';
import styled from 'styled-components';
import { useDevice } from 'utils/useDevice';

const DeselectContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	column-gap: 20px;
	row-gap: 20px;
	width: 100%;
	min-height: 162px;
	border: 1px solid;
	border-radius: 8px;
	padding-top: 15px;
	padding-bottom: 15px;
	padding-left: 30px;
	padding-right: 30px;
	align-content: start;
	justify-content: center;
	border-color: ${({ theme }) => (theme.isDark ? theme.color.white : undefined)};

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 10px;
		row-gap: 10px;
		padding: 15px;
		min-height: 182px;
	}
`;

const SelectContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	column-gap: 30px;
	row-gap: 20px;

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 15px;
		row-gap: 10px;
	}
`;

const DeselectButton = styled(TextButton)`
	height: 30px;
	padding: 0px;
	color: ${({ theme }) => (theme.isDark ? theme.color.red : undefined)};
	border-color: ${({ theme }) => (theme.isDark ? theme.color.red : undefined)};
`;

const SelectButton = styled(TextButton)`
	color: ${({ disabled, theme }) =>
		disabled ? theme.color.white : theme.isLight ? theme.color.gray : theme.color.white};
	border-color: ${({ theme, disabled }) =>
		disabled ? theme.color.gray : theme.isLight ? theme.color.gray : theme.color.white};
	background-color: ${({ disabled, theme }) =>
		disabled ? theme.color.gray : theme.isLight ? theme.color.white : theme.color.black};

	height: 30px;
`;

const ExtButton = styled(TextButton)`
	flex: 1;

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		max-width: 220px;
	}
`;

interface IConfirmMnemonicViewProps {
	randomisedWords: Array<string>;
	selectedWords: Array<string>;
	isCorrect: boolean;
	onSelectWord: (word: string) => void;
	onDeselectWord: (word: string) => void;
	onSubmit: () => void;
}

export const ConfirmMnemonicView: FC<IConfirmMnemonicViewProps> = ({
	randomisedWords,
	selectedWords,
	isCorrect,
	onSelectWord,
	onDeselectWord,
	onSubmit,
}) => {
	const { isMobile } = useDevice();

	return (
		<HomeLayout>
			<PageCard direction="column">
				<Col gap="m">
					<Row justifyContent="center">
						<Text fontSize="xl" fontWeight="bold" color="primary" textAlign="center">
							Confirm your Secret Recovery Phrase
						</Text>
					</Row>
					<Text fontSize="m">Please select each word in order to make sure it is correct</Text>
					<DeselectContainer>
						{selectedWords.map((word) => (
							<DeselectButton type="secondary" size="s" text={word} onClick={() => onDeselectWord(word)} />
						))}
					</DeselectContainer>
					<SelectContainer>
						{randomisedWords.map((word) =>
							selectedWords.includes(word) ? (
								<SelectButton type="secondary" size="s" text={word} onClick={() => undefined} disabled />
							) : (
								<SelectButton type="secondary" size="s" text={word} onClick={() => onSelectWord(word)} />
							)
						)}
					</SelectContainer>
					<Row justifyContent="center">
						<ExtButton
							type="primary"
							size={isMobile ? 's' : undefined}
							text="Confirm"
							onClick={onSubmit}
							disabled={!isCorrect}
						/>
					</Row>
				</Col>
			</PageCard>
		</HomeLayout>
	);
};
