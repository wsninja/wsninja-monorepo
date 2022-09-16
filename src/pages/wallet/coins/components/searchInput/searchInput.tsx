import { Row } from 'components/flex/row';
import { toPx } from 'components/flex/utils';
import { Input } from 'components/form/input/input';
import { Icon } from 'components/icon/icon';
import { FC, InputHTMLAttributes } from 'react';
import styled, { useTheme } from 'styled-components';

const StyledSearchInput = styled(Input)`
	border: none;
	min-height: 48px;
	width: 100%;
	background-color: ${({ theme }) => theme.color.primaryBackground};
	padding-left: ${({ theme }) => toPx(theme.distance.m * 2 + 32)};
	box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);

	::placeholder {
		opacity: 0.5;
	}
`;

const Relative = styled.div`
	display: flex;
	position: relative;
	align-items: center;
`;

const Absolute = styled.div`
	display: flex;
	position: absolute;
	width: ${({ theme }) => toPx(theme.distance.m * 2 + 32)};
	justify-content: center;
	opacity: 0.5;
`;

interface ISearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: FC<ISearchInputProps> = ({ ...props }) => {
	const theme = useTheme();

	return (
		<Row>
			<Relative>
				<Absolute>
					<Icon name="search" size={16} color={theme.color.primary} />
				</Absolute>
			</Relative>
			<StyledSearchInput {...props} />
		</Row>
	);
};
