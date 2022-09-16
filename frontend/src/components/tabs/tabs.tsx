import clsx from 'clsx';
import React, { Component, ReactNode } from 'react';
import './Tabs.scss';

interface ITabsProps<T extends string | number> {
	children?: ReactNode;
	className?: string;
	options: Array<T>;
	current: T;
	isDarkTheme: boolean;
	onTabChange: (option: T) => void;
}

export class Tabs<T extends string | number> extends Component<ITabsProps<T>> {
	render() {
		const { className, current, options, onTabChange, isDarkTheme, children } = this.props;
		return (
			<div className={clsx('Tabs', isDarkTheme && 'Tabs--dark', className)}>
				{options.map((option) => (
					<span
						key={option}
						className={clsx('Tabs__tab', current === option && 'Tabs__tab--active')}
						onClick={() => onTabChange(option)}
					>
						{option}
					</span>
				))}
				{children}
			</div>
		);
	}
}
