import { Component } from 'react';
import { connect } from 'react-redux';
import { IDispatch, IRootState } from 'store/store';
import { logout } from 'store/user/actions';

const storageKey = 'ff6ffd4bad326343d55cfbbb39697e0328e0dd397524b0858c0cd1bd2607d8a0';

interface IIdleTimerProps {
	isAuthenticated: boolean;
	isSessionTimeout: boolean;
	logout: () => void;
}

class IdleTimer extends Component<IIdleTimerProps> {
	timeoutInterval: NodeJS.Timeout | undefined;

	componentDidMount() {
		const { isAuthenticated } = this.props;
		window.addEventListener('keydown', this.timeoutResetter);
		window.addEventListener('mousemove', this.timeoutResetter);
		window.addEventListener('scroll', this.timeoutResetter);
		if (isAuthenticated) {
			this.startChecking();
		}
	}

	componentWillUnmount() {
		this.stopChecking();
		window.removeEventListener('keydown', this.timeoutResetter);
		window.removeEventListener('mousemove', this.timeoutResetter);
		window.removeEventListener('scroll', this.timeoutResetter);
	}

	componentDidUpdate(prevProps: IIdleTimerProps) {
		const { isAuthenticated } = this.props;
		if (prevProps.isAuthenticated !== isAuthenticated) {
			if (isAuthenticated) {
				this.startChecking();
			} else {
				this.stopChecking();
			}
		}
	}

	timeoutResetter = () => {
		const { isAuthenticated } = this.props;
		if (isAuthenticated) {
			localStorage.setItem(storageKey, Date.now().toString());
		}
	};

	startChecking = () => {
		if (this.timeoutInterval === undefined) {
			localStorage.setItem(storageKey, Date.now().toString());
			this.timeoutInterval = setInterval(this.timeoutChecker, 1000 * 10);
		}
	};

	stopChecking = () => {
		if (this.timeoutInterval !== undefined) {
			clearInterval(this.timeoutInterval);
			this.timeoutInterval = undefined;
		}
	};

	timeoutChecker = () => {
		const { isAuthenticated, isSessionTimeout } = this.props;
		if (isAuthenticated && isSessionTimeout) {
			const oldTimestamp = Number(localStorage.getItem(storageKey) ?? Date.now());
			const newTimestamp = Date.now();
			if (oldTimestamp < newTimestamp - 1000 * 60 * 15) {
				this.props.logout();
			}
		}
	};

	render() {
		return null;
	}
}

const mapStateToProps = ({
	user: {
		isAuthenticated,
		settings: { isSessionTimeout },
	},
}: IRootState) => ({
	isAuthenticated,
	isSessionTimeout,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	logout: () => dispatch(logout()),
});

const idleTimer = connect(mapStateToProps, mapDispatchToProps)(IdleTimer);

export { idleTimer as IdleTimer };
