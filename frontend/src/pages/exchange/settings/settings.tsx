import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { RadioGroup } from 'components/form/radioGroup/radioGroup';
import { Switch } from 'components/form/swtich/switch';
import { Icon } from 'components/icon/icon';
import { Modal } from 'components/modal/modal';
import { CustomToken } from 'pages/exchange/customToken';
import React, { FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { ICustomToken } from 'types';
import { useDevice } from 'utils/useDevice';
import './Settings.scss';

export const SLIPPAGE_OPTIONS = [
	{ id: 1, title: '0.1%', payload: 0.1 },
	{ id: 2, title: '0.5%', payload: 0.5 },
	{ id: 3, title: '1.0%', payload: 1 },
	{ id: 4, title: '3.0%', payload: 3 },
];

export const GAS_PRICE_OPTIONS = [
	{ id: 1, title: '100% Standard', payload: 100n },
	{ id: 2, title: '125% Fast', payload: 125n },
	{ id: 3, title: '150% Instant', payload: 150n },
];

interface ISettingsProps {
	allowPartialFill: boolean;
	onChangeAllowPartialFill: (allowPartialFill: boolean) => void;
	slippageToleranceId: number;
	onChangeSlippageTolerance: (slippageToleranceId: number, slippageTolerance: number) => void;
	gasPricePercentageId: number;
	onChangeGasPricePercentage: (gasPricePercentageId: number, gasPricePercentage: bigint) => void;
	customTokens: Array<ICustomToken>;
	onAddCustomToken: (customTokenAddress: string) => void;
	onClose: () => void;
}

export const Settings: FC<ISettingsProps> = ({
	onClose,
	allowPartialFill,
	onChangeAllowPartialFill,
	slippageToleranceId,
	onChangeSlippageTolerance,
	gasPricePercentageId,
	onChangeGasPricePercentage,
	customTokens,
	onAddCustomToken,
}) => {
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const [showPartialFillTooltip, setShowPartialFillTooltip] = useState(false);
	const [showTolerenceOptions, setShowTolerenceOptions] = useState(false);
	const [showGasPriceOptions, setShowGasPriceOptions] = useState(false);
	const [showCustomTokens, setShowCustomTokens] = useState(false);
	const [showTokenForm, setShowTokenForm] = useState(false);
	const [tokenAddress, setTokenAddress] = useState('');

	const reset = useCallback(() => {
		onChangeAllowPartialFill(false);
		onChangeSlippageTolerance(SLIPPAGE_OPTIONS[0].id, SLIPPAGE_OPTIONS[0].payload);
		onChangeGasPricePercentage(GAS_PRICE_OPTIONS[0].id, GAS_PRICE_OPTIONS[0].payload);
	}, [onChangeAllowPartialFill, onChangeSlippageTolerance, onChangeGasPricePercentage]);

	return (
		<div
			className={clsx(
				'ExchangeSettings',
				isDarkTheme && 'ExchangeSettings--dark',
				isDesktop && 'ExchangeSettings--desktop'
			)}
		>
			<div className="ExchangeSettings__header">
				<h4 className="ExchangeSettings__header-heading">Advanced Settings</h4>
				<Icon className="ExchangeSettings__header-close" name="close" onClick={onClose} />
			</div>
			<div className="ExchangeSettings__setting">
				<p className="ExchangeSettings__setting-key">
					Partial Fill{' '}
					<Icon
						className="ExchangeSettings__setting-key-icon"
						name="info"
						size={16}
						onMouseEnter={() => setShowPartialFillTooltip(true)}
						onMouseLeave={() => setShowPartialFillTooltip(false)}
					/>
					{showPartialFillTooltip && (
						<span className="ExchangeSettings__setting-key-tooltip">
							Partial fill applies only when swap routes has several main route parts. It allows to partially execute in
							order to prevent transaction revert when market price gets worse
						</span>
					)}
				</p>
				<Switch
					name="partial-fill"
					checked={allowPartialFill}
					onChange={() => onChangeAllowPartialFill(!allowPartialFill)}
				/>
			</div>
			<div className="ExchangeSettings__setting">
				<p className="ExchangeSettings__setting-key">Slippage Tolerence</p>
				<span
					className="ExchangeSettings__setting-value"
					onClick={() => setShowTolerenceOptions(!showTolerenceOptions)}
				>
					{SLIPPAGE_OPTIONS.find(({ id }) => id === slippageToleranceId)?.title ?? 'NA'}
					<Icon className="ExchangeSettings__setting-value-icon" name="chevron-tiny-down" />
				</span>
			</div>
			{showTolerenceOptions && (
				<RadioGroup
					className="ExchangeSettings__radio-group"
					selectedOptionId={slippageToleranceId}
					onChangeOption={(slippageToleranceId, slippageTolerance) => {
						onChangeSlippageTolerance(slippageToleranceId, slippageTolerance);
						setShowTolerenceOptions(false);
					}}
					options={SLIPPAGE_OPTIONS}
					isDarkTheme={isDarkTheme}
				/>
			)}
			<div className="ExchangeSettings__setting">
				<p className="ExchangeSettings__setting-key">Gas Price</p>
				<span className="ExchangeSettings__setting-value" onClick={() => setShowGasPriceOptions(!showGasPriceOptions)}>
					{GAS_PRICE_OPTIONS.find(({ id }) => id === gasPricePercentageId)?.title ?? 'NA'}
					<Icon className="ExchangeSettings__setting-value-icon" name="chevron-tiny-down" />
				</span>
			</div>
			{showGasPriceOptions && (
				<RadioGroup
					className="ExchangeSettings__radio-group"
					selectedOptionId={gasPricePercentageId}
					onChangeOption={(gasPricePercentageId, gasPricePercentage) => {
						onChangeGasPricePercentage(gasPricePercentageId, gasPricePercentage);
						setShowGasPriceOptions(false);
					}}
					options={GAS_PRICE_OPTIONS}
					isDarkTheme={isDarkTheme}
				/>
			)}
			<div className="ExchangeSettings__setting">
				<p className="ExchangeSettings__setting-key">
					Custom Tokens{' '}
					<Icon
						className="ExchangeSettings__setting-key-icon"
						name="outline-plus"
						onClick={() => setShowTokenForm(true)}
					/>
				</p>
				<span className="ExchangeSettings__setting-value" onClick={() => setShowCustomTokens(!showCustomTokens)}>
					{customTokens.length}
					<Icon className="ExchangeSettings__setting-value-icon" name="chevron-tiny-down" />
				</span>
			</div>
			{showCustomTokens && (
				<div className="ExchangeSettings__list">
					{customTokens.map((token) => (
						<div className="ExchangeSettings__list-token" key={token.address}>
							<img
								className="ExchangeSettings__list-token-image"
								src={token.logoUri}
								alt={token.symbol}
								onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
							/>
							<span className="ExchangeSettings__list-token-name">{token.name}</span>
							<span className="ExchangeSettings__list-token-value">
								{/* {token.value}
								{token.unit} */}
							</span>
						</div>
					))}
				</div>
			)}
			<div className="ExchangeSettings__cta">
				<Button
					variant="solid"
					color="primary"
					className="ExchangeSettings__cta-btn"
					onClick={reset}
					size={isDesktop ? 'lg' : undefined}
				>
					Reset
				</Button>
				<Button
					variant="outline"
					color="primary"
					className="ExchangeSettings__cta-btn"
					onClick={onClose}
					size={isDesktop ? 'lg' : undefined}
				>
					Close
				</Button>
				<Modal isOpen={showTokenForm} close={() => setShowTokenForm(false)} heading="Add Custom Token">
					<CustomToken
						address={tokenAddress}
						inPopover={false}
						onChangeAddress={setTokenAddress}
						onAddCustomToken={onAddCustomToken}
					/>
				</Modal>
			</div>
		</div>
	);
};
