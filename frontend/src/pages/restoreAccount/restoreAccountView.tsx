import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { PageCard } from 'components/pageCard/pageCard';
import { Text } from 'components/text/text';
import { FC } from 'react';

interface IRestoreAccountViewProps {
	onKeyfile: () => void;
	onMnemonic: () => void;
}

export const RestoreAccountView: FC<IRestoreAccountViewProps> = ({ onKeyfile, onMnemonic }) => {
	return (
		<HomeLayout>
			<PageCard direction="column">
				<Col gap="m">
					<Row justifyContent="center">
						<Text fontSize="xl" mobileFontSize="l" fontWeight="bold" color="primary">
							Select Software Wallet
						</Text>
					</Row>
					<Text fontSize="m" color="primary">
						Please select an opton to restore your wallet
					</Text>
					<TextButton type="primary" text="Keyfile" onClick={onKeyfile} />
					<TextButton type="primary" text="Passphrase" onClick={onMnemonic} />
				</Col>
			</PageCard>
		</HomeLayout>
	);
};
