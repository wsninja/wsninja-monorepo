import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Button } from 'components/form/button/button';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import { Modal } from 'components/modal/modal';
import { Tabs } from 'components/tabs/tabs';
import { PasswordModal } from 'modals/passwordModal/passwordModal';
import { Coin } from 'pages/exchange/coin/coin';
import { CustomToken } from 'pages/exchange/customToken';
import { Settings } from 'pages/exchange/settings/settings';
import { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Popover } from 'react-tiny-popover';
import { IRootState } from 'store/store';
import { ICustomToken, ISwapToken } from 'types';
import { currencyFmt } from 'utils/currencyFmt';
import { useDevice } from 'utils/useDevice';
import { bigNumberToString } from 'utils/utils';
import './Exchange.scss';

type IExchangeTabType = 'market';

const TABS: Array<IExchangeTabType> = ['market'];

interface IExchangeViewProps {
	isLoading: boolean;
	isSwapSupported: boolean;
	srcToken: ISwapToken | undefined;
	onChangeSrcToken: (srcToken: ISwapToken) => void;
	destToken: ISwapToken | undefined;
	onChangeDestToken: (destToken: ISwapToken) => void;
	isAskingPassword: boolean;
	isSwapping: boolean;
	transactionGasCost: number;
	transactionUsdCost: number;
	srcValue: string;
	onChangeSrcValue: (srcValue: string) => void;
	destValue: string;
	tokens: Array<ISwapToken>;
	onSwapSrcDestToken: () => void;
	onRefresh: () => void;
	onStartSwap: () => void;
	onCancelSwap: () => void;
	onSwap: () => void;

	// Settings
	allowPartialFill: boolean;
	onChangeAllowPartialFill: (allowPartialFill: boolean) => void;
	slippageToleranceId: number;
	onChangeSlippageTolerance: (slippageToleranceId: number, slippageTolerence: number) => void;
	gasPricePercentageId: number;
	onChangeGasPricePercentage: (gasPricePercentageId: number, gasPricePercentage: bigint) => void;
	customTokens: Array<ICustomToken>;
	onAddCustomToken: (customTokenAddress: string) => Promise<void>;
}

export const ExchangeView: FC<IExchangeViewProps> = ({
	isLoading,
	isSwapSupported,
	srcToken,
	onChangeSrcToken,
	destToken,
	onChangeDestToken,
	isAskingPassword,
	isSwapping,
	transactionGasCost,
	transactionUsdCost,
	srcValue,
	onChangeSrcValue,
	destValue,
	tokens,
	onSwapSrcDestToken,
	onRefresh,
	onStartSwap,
	onCancelSwap,
	onSwap,

	// Settings
	allowPartialFill,
	onChangeAllowPartialFill,
	slippageToleranceId,
	onChangeSlippageTolerance,
	gasPricePercentageId,
	onChangeGasPricePercentage,
	customTokens,
	onAddCustomToken,
}) => {
	const { isDesktop, isMobile } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const [isSettingsVisible, setIsSettingsVisible] = useState(false);
	const [isTokenPopoverOpen, setIsTokenPopoverOpen] = useState(false);
	const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
	const [tokenAddress, setTokenAddress] = useState('');

	const srcTokens = useMemo(
		() => tokens.filter((token) => token.symbol.toLowerCase() !== destToken?.symbol.toLowerCase()),
		[tokens, destToken]
	);

	const destTokens = useMemo(
		() => tokens.filter((token) => token.symbol.toLowerCase() !== srcToken?.symbol.toLowerCase()),
		[tokens, srcToken]
	);

	const sellPrice = useMemo(() => {
		const numberedSrcValue = new BigNumber(srcValue);
		const numberedDestValue = new BigNumber(destValue);
		if (numberedSrcValue.isFinite() && numberedDestValue.isFinite()) {
			return bigNumberToString(numberedDestValue.div(numberedSrcValue));
		}
		return '0';
	}, [srcValue, destValue]);

	const buyPrice = useMemo(() => {
		const numberedSrcValue = new BigNumber(srcValue);
		const numberedDestValue = new BigNumber(destValue);
		if (numberedSrcValue.isFinite() && numberedDestValue.isFinite()) {
			return bigNumberToString(numberedSrcValue.div(numberedDestValue));
		}
		return '0';
	}, [srcValue, destValue]);

	const handleAddCustomToken = useCallback(
		async (customTokenAddress: string) => {
			await onAddCustomToken(customTokenAddress);
			setIsTokenPopoverOpen(false);
			setIsTokenModalVisible(false);
		},
		[onAddCustomToken]
	);

	const renderInfo = useMemo(() => {
		if (!srcToken || !destToken) {
			return null;
		}
		return (
			<>
				<div className="Exchange__main-card-info">
					<p className="Exchange__main-card-info-key">Sell Price</p>
					<p className="Exchange__main-card-info-value">
						1 {srcToken.symbol} = <span className="Exchange__main-card-info-value-highlight">{sellPrice}</span>{' '}
						{destToken.symbol}
					</p>
				</div>
				<div className={clsx('Exchange__main-card-help-text', isDarkTheme && 'Exchange__main-card-help-text--dark')}>
					~{currencyFmt(srcToken.priceInUsd ?? NaN)}
				</div>
				<div className="Exchange__main-card-info">
					<p className="Exchange__main-card-info-key">Buy Price</p>
					<p className="Exchange__main-card-info-value">
						1 {destToken.symbol} = <span className="Exchange__main-card-info-value-highlight">{buyPrice}</span>{' '}
						{srcToken.symbol}
					</p>
				</div>
				<div className={clsx('Exchange__main-card-help-text', isDarkTheme && 'Exchange__main-card-help-text--dark')}>
					~{currencyFmt(destToken.priceInUsd ?? NaN)}
				</div>
				<div className="Exchange__main-card-info">
					<p className="Exchange__main-card-info-key">Transaction Cost</p>
					<p className="Exchange__main-card-info-value">~{currencyFmt(transactionUsdCost, true)}</p>
				</div>
				<div className={clsx('Exchange__main-card-help-text', isDarkTheme && 'Exchange__main-card-help-text--dark')}>
					{bigNumberToString(new BigNumber(transactionGasCost))}
				</div>
			</>
		);
	}, [srcToken, destToken, sellPrice, buyPrice, transactionGasCost, transactionUsdCost, isDarkTheme]);

	const renderContent = useMemo(() => {
		return (
			<>
				{isSettingsVisible ? (
					<Settings
						onClose={() => setIsSettingsVisible(false)}
						allowPartialFill={allowPartialFill}
						onChangeAllowPartialFill={onChangeAllowPartialFill}
						slippageToleranceId={slippageToleranceId}
						onChangeSlippageTolerance={onChangeSlippageTolerance}
						gasPricePercentageId={gasPricePercentageId}
						onChangeGasPricePercentage={onChangeGasPricePercentage}
						customTokens={customTokens}
						onAddCustomToken={onAddCustomToken}
					/>
				) : (
					<>
						<div
							className={clsx(
								'Exchange__main',
								isDesktop && 'Exchange__main--desktop',
								isDarkTheme && 'Exchange__main--dark'
							)}
						>
							<div className="Exchange__main-header">
								<Tabs<IExchangeTabType>
									className="Exchange__main-header-tabs"
									options={TABS}
									current={'market'}
									onTabChange={() => undefined}
									isDarkTheme={isDarkTheme}
								/>
								<div className="Exchange__main-header-actions">
									<Icon className="Exchange__main-header-actions-icon" name="refresh" onClick={onRefresh} />
									<Popover
										isOpen={isTokenPopoverOpen}
										positions={['bottom', 'right', 'left', 'top']}
										onClickOutside={() => setIsTokenPopoverOpen(false)}
										content={
											<CustomToken
												inPopover={true}
												address={tokenAddress}
												onChangeAddress={setTokenAddress}
												onAddCustomToken={handleAddCustomToken}
											/>
										}
									>
										<Icon
											className="Exchange__main-header-actions-icon"
											name="outline-plus"
											onClick={() =>
												isDesktop ? setIsTokenPopoverOpen(!isTokenPopoverOpen) : setIsTokenModalVisible(true)
											}
										/>
									</Popover>
									<Icon
										className="Exchange__main-header-actions-icon"
										name="settings"
										onClick={() => setIsSettingsVisible(true)}
									/>
								</div>
							</div>
							<Coin
								className="Exchange__main-from"
								isDarkTheme={isDarkTheme}
								label="You Pay"
								token={srcToken}
								value={srcValue}
								onChangeText={onChangeSrcValue}
								coins={srcTokens}
								onCoinSelect={onChangeSrcToken}
							/>
							{/* <BaseButton onClick={onSwapSrcDestToken}> */}
							<Icon className="Exchange__main-icon" name="fa-exchange" onClick={onSwapSrcDestToken} />
							{/* </BaseButton> */}
							<Coin
								className="Exchange__main-to"
								isDarkTheme={isDarkTheme}
								label="You Receive"
								token={destToken}
								value={bigNumberToString(new BigNumber(destValue))}
								coins={destTokens}
								onCoinSelect={onChangeDestToken}
							/>
							<div className="Exchange__main-card"> {renderInfo} </div>
						</div>
						<Button
							variant="solid"
							color="primary"
							className={clsx('Exchange__cta', isDesktop && 'Exchange__cta--desktop')}
							onClick={onStartSwap}
							size={isDesktop ? 'lg' : undefined}
							isDarkTheme={isDarkTheme}
							loading={isAskingPassword || isSwapping}
						>
							Swap
						</Button>
						{isMobile && (
							<Modal
								isOpen={isTokenModalVisible}
								close={() => setIsTokenModalVisible(false)}
								heading="Add Custom Token"
							>
								<CustomToken
									address={tokenAddress}
									inPopover={false}
									onChangeAddress={setTokenAddress}
									onAddCustomToken={handleAddCustomToken}
								/>
							</Modal>
						)}
					</>
				)}
			</>
		);
	}, [
		isSettingsVisible,
		setIsSettingsVisible,
		allowPartialFill,
		onChangeAllowPartialFill,
		slippageToleranceId,
		onChangeSlippageTolerance,
		gasPricePercentageId,
		onChangeGasPricePercentage,
		customTokens,
		onAddCustomToken,
		isDesktop,
		isMobile,
		isDarkTheme,
		isTokenPopoverOpen,
		setIsTokenPopoverOpen,
		tokenAddress,
		setTokenAddress,
		isTokenModalVisible,
		setIsTokenModalVisible,
		srcToken,
		onChangeSrcToken,
		destToken,
		onChangeDestToken,
		onChangeSrcValue,
		srcValue,
		destValue,
		renderInfo,
		destTokens,
		onSwapSrcDestToken,
		srcTokens,
		onRefresh,
		handleAddCustomToken,
		isAskingPassword,
		isSwapping,
		onStartSwap,
	]);

	if (isDesktop) {
		return (
			<>
				<DashboardLayout>
					<div className={clsx('DesktopExchange', isDarkTheme && 'DesktopExchange--dark')}>
						{isLoading ? (
							<Loader />
						) : isSwapSupported ? (
							<div className="DesktopExchange__card">{renderContent}</div>
						) : (
							'This blockchain is not supported for exchange'
						)}
					</div>
				</DashboardLayout>
				{isAskingPassword && <PasswordModal onClose={onCancelSwap} onConfirm={onSwap} />}
			</>
		);
	}
	return (
		<>
			<DashboardLayout className="Exchange">
				<header className="Exchange__header">
					<h1 className="Exchange__header-heading">Exchange</h1>
				</header>
				{isLoading ? <Loader /> : isSwapSupported ? renderContent : 'This blockchain is not supported for exchange'}
			</DashboardLayout>
			{isAskingPassword && <PasswordModal onClose={onCancelSwap} onConfirm={onSwap} />}
		</>
	);
};
