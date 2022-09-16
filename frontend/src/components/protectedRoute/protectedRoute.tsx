import { ComponentType, FC } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { IRootState } from 'store/store';

interface ProtectedRouteProps {
	component: ComponentType<any> | FC<any>;
	exact?: boolean;
	path: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
	const { isAuthenticated } = useSelector((state: IRootState) => state.user);

	return (
		<Route {...rest} render={(props) => (isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />)} />
	);
};
