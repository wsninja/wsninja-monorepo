import { FC } from 'react';
import styled from 'styled-components';

const StyledCanvas = styled.canvas`
	position: absolute;
	visibility: hidden;
`;

interface IQrCodeScannerViewProps {
	className?: string;
	canvasElementId: string;
	videoElementId: string;
}

export const QrCodeScannerView: FC<IQrCodeScannerViewProps> = ({ className, canvasElementId, videoElementId }) => {
	return (
		<>
			<StyledCanvas id={canvasElementId} />
			<video id={videoElementId} className={className} autoPlay muted playsInline />
		</>
	);
};
