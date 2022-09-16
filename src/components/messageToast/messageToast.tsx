import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { Icon, IIcon } from 'components/icon/icon';
import { Text } from 'components/text/text';
import React, { FC } from 'react';
import styled from 'styled-components';

const ExtIcon = styled(Icon)`
	margin-right: 10px;
`;

interface IMessageToastProps {
	icon: IIcon;
	heading?: string;
	message: string;
}

export const MessageToast: FC<IMessageToastProps> = ({ icon, heading, message }) => {
	return (
		<Row alignItems="center">
			<ExtIcon name={icon} />
			<Col>
				{heading && <Text fontSize="l">{heading}</Text>}
				<Text fontSize="m">{message}</Text>
			</Col>
		</Row>
	);
};
