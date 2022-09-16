import clsx from 'clsx';
import React, { Component } from 'react';
import './RadioGroup.scss';

interface IRadioGroupOption<T> {
	id: number;
	title: string;
	payload: T;
}

interface IRadioGroupProps<T> {
	className?: string;
	selectedOptionId: number | undefined;
	options: Array<IRadioGroupOption<T>>;
	isDarkTheme: boolean;
	onChangeOption: (id: number, payload: T) => void;
}

export class RadioGroup<T> extends Component<IRadioGroupProps<T>> {
	render() {
		const { className, selectedOptionId, onChangeOption, options, isDarkTheme } = this.props;
		return (
			<div className={clsx('RadioGroup', className, isDarkTheme && 'RadioGroup--dark')}>
				{options.map(({ id, title, payload }) => (
					<div
						className={clsx('RadioGroup__tab', selectedOptionId === id && 'RadioGroup__tab--active')}
						key={id.toString()}
						role="button"
						tabIndex={0}
						onClick={() => onChangeOption(id, payload)}
					>
						{title}
					</div>
				))}
			</div>
		);
	}
}
