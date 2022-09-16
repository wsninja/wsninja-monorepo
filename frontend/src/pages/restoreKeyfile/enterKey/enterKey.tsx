import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import React, { ChangeEventHandler, FC } from 'react';
import { useBrowser } from 'utils/utils';
import './EnterKey.scss';

interface IEnterKeyProps {
	value: string;
	isDarkTheme: boolean;
	onChange: ChangeEventHandler<HTMLTextAreaElement>;
	onPaste: () => void;
}

export const EnterKey: FC<IEnterKeyProps> = ({ value, isDarkTheme, onChange, onPaste }) => {
	const browser = useBrowser();

	return (
		<div className="EnterKey">
			<textarea
				className={clsx('EnterKey__textarea', isDarkTheme && 'EnterKey__textarea--dark')}
				rows={10}
				placeholder="Enter Key"
				value={value}
				onChange={(e) => onChange(e)}
			/>
			{browser && browser.name !== 'firefox' && (
				<Button
					className="EnterKey__paste-btn"
					variant="solid"
					color="primary"
					onClick={onPaste}
					isDarkTheme={isDarkTheme}
				>
					Paste
				</Button>
			)}
		</div>
	);
};
