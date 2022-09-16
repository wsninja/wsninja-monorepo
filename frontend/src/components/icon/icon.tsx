import { AppsDesktop } from 'assets/images/icons/appsDesktop';
import { CogDesktop } from 'assets/images/icons/cogDesktop';
import { DexDesktop } from 'assets/images/icons/dexDesktop';
import { GitBook } from 'assets/images/icons/gitBook';
import { HomeDesktop } from 'assets/images/icons/homeDesktop';
import { MoonDesktop } from 'assets/images/icons/moonDesktop';
import { NotificationDesktop } from 'assets/images/icons/notificationDesktop';
import { SunDesktop } from 'assets/images/icons/sunDesktop';
import { WalletDesktop } from 'assets/images/icons/walletDesktop';
import { uniqueId } from 'lodash';
import React, { forwardRef, HTMLAttributes, useEffect, useMemo } from 'react';
import { AiFillWarning, AiOutlineInfoCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import { BiChevronDown, BiPlus } from 'react-icons/bi';
import {
	FaBars,
	FaBolt,
	FaCheck,
	FaCheckDouble,
	FaCheckSquare,
	FaChevronDown,
	FaChevronLeft,
	FaChevronUp,
	FaClone,
	FaExchangeAlt,
	FaEye,
	FaGithubAlt,
	FaInstagram,
	FaLock,
	FaMediumM,
	FaRedditAlien,
	FaSearch,
	FaShareAlt,
	FaTelegramPlane,
	FaTrashAlt,
	FaTwitter,
} from 'react-icons/fa';
import { GoSignOut } from 'react-icons/go';
import { HiDownload, HiUpload } from 'react-icons/hi';
import { ImSpinner2 } from 'react-icons/im';
import { IoBookmarks } from 'react-icons/io5';
import { VscClose, VscRefresh, VscSettings } from 'react-icons/vsc';

export type IIcon =
	| 'apps'
	| 'bars'
	| 'bell'
	| 'bolt'
	| 'bookmark'
	| 'check'
	| 'check-double'
	| 'check-square'
	| 'chevron-down'
	| 'chevron-left'
	| 'chevron-tiny-down'
	| 'chevron-up'
	| 'clone'
	| 'close'
	| 'cog'
	| 'download'
	| 'exchange'
	| 'eye'
	| 'fa-exchange'
	| 'gitbook'
	| 'github'
	| 'home'
	| 'info'
	| 'instagram'
	| 'lock'
	| 'medium'
	| 'moon'
	| 'outline-plus'
	| 'plus'
	| 'reddit'
	| 'refresh'
	| 'search'
	| 'settings'
	| 'share'
	| 'sign-out'
	| 'sun'
	| 'spinner'
	| 'telegram'
	| 'trash'
	| 'twitter'
	| 'upload'
	| 'wallet'
	| 'warning';

const handleMousedown = (event: globalThis.MouseEvent) => {
	if (event.detail > 1) {
		event.preventDefault();
	}
};

export interface IIconProps extends HTMLAttributes<HTMLSpanElement> {
	className?: string;
	name: IIcon;
	color?: string;
	size?: number;
	onClick?: () => void;
}

export const Icon = forwardRef<HTMLSpanElement, IIconProps>(
	({ className, name, color, size = 20, onClick, ...props }, ref) => {
		const renderIcon = useMemo(() => {
			switch (name) {
				case 'apps':
					return <AppsDesktop color={color} size={size} />;
				case 'bars':
					return <FaBars size={size} />;
				case 'bell':
					return <NotificationDesktop size={size} color={color} />;
				case 'bolt':
					return <FaBolt size={size} />;
				case 'bookmark':
					return <IoBookmarks color={color} size={size} />;
				case 'check':
					return <FaCheck size={size} />;
				case 'check-double':
					return <FaCheckDouble size={size} />;
				case 'check-square':
					return <FaCheckSquare size={size} />;
				case 'chevron-down':
					return <FaChevronDown size={size} />;
				case 'chevron-left':
					return <FaChevronLeft color={color} size={size} />;
				case 'chevron-tiny-down':
					return <BiChevronDown size={size} />;
				case 'chevron-up':
					return <FaChevronUp size={size} />;
				case 'clone':
					return <FaClone size={size} />;
				case 'close':
					return <VscClose size={size} />;
				case 'cog':
					return <CogDesktop color={color} size={size} />;
				case 'download':
					return <HiDownload size={size} />;
				case 'exchange':
					return <DexDesktop color={color} size={size} />;
				case 'eye':
					return <FaEye size={size} />;
				case 'fa-exchange':
					return <FaExchangeAlt size={size} />;
				case 'gitbook':
					return <GitBook color={color} size={size} />;
				case 'github':
					return <FaGithubAlt size={size} />;
				case 'home':
					return <HomeDesktop color={color} size={size} />;
				case 'info':
					return <AiOutlineInfoCircle size={size} />;
				case 'instagram':
					return <FaInstagram color={color} size={size} />;
				case 'lock':
					return <FaLock color={color} size={size} />;
				case 'medium':
					return <FaMediumM size={size} />;
				case 'moon':
					return <MoonDesktop color={color} size={size} />;
				case 'outline-plus':
					return <AiOutlinePlusCircle size={size} />;
				case 'plus':
					return <BiPlus size={size} />;
				case 'reddit':
					return <FaRedditAlien size={size} />;
				case 'refresh':
					return <VscRefresh size={size} />;
				case 'search':
					return <FaSearch color={color} size={size} />;
				case 'settings':
					return <VscSettings size={size} />;
				case 'share':
					return <FaShareAlt size={size} />;
				case 'sign-out':
					return <GoSignOut size={size} />;
				case 'sun':
					return <SunDesktop color={color} size={size} />;
				case 'spinner':
					return <ImSpinner2 color={color} size={size} />;
				case 'telegram':
					return <FaTelegramPlane size={size} />;
				case 'trash':
					return <FaTrashAlt size={size} />;
				case 'twitter':
					return <FaTwitter size={size} />;
				case 'upload':
					return <HiUpload size={size} />;
				case 'wallet':
					return <WalletDesktop color={color} size={size} />;
				case 'warning':
					return <AiFillWarning size={size} />;
				default:
					return '-';
			}
		}, [color, name, size]);

		const iconSpanId = useMemo(() => uniqueId('Icon-span-'), []);

		useEffect(() => {
			if (onClick) {
				const iconSpan = document.getElementById(iconSpanId);
				if (iconSpan) {
					iconSpan.addEventListener('mousedown', handleMousedown);
				}

				return () => iconSpan?.removeEventListener('mousedown', handleMousedown);
			}
		}, [onClick, iconSpanId]);

		return (
			<span id={iconSpanId} className={className} onClick={onClick} ref={ref} {...props}>
				{renderIcon}
			</span>
		);
	}
);
