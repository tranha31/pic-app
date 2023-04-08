import Button from '../../base/Button';
import styles from './Login.module.scss';
import classNames from 'classnames/bind';
import Draggable from 'react-draggable';

const cx = classNames.bind(styles);

function Login() {
    return ( 
        <div className={cx('login-wrapper', 'd-flex', 'justify-center', 'align-center')}>
            <div className={cx('black-background')}></div>
            <Draggable bounds='parent' >
                <div className={cx('popup-detail-content', 'd-flex', 'flex-column')}>
                    <div className={cx('title')}>PICBIN Manager</div>
                    <div className={cx('d-flex', 'flex-1', 'flex-column')}>
                        <div className={cx('item', 'd-flex', 'flex-column', 'w-full')}>
                            <div className={cx('font-bold')}>Username</div>
                            <input className={cx('input')}/>
                        </div>
                        <div className={cx('item', 'd-flex', 'flex-column', 'w-full')}>
                            <div className={cx('font-bold')}>Password</div>
                            <input type='password' className={cx('input')}/>
                        </div>
                    </div>
                    <Button primary>Login</Button>
                </div>
            </Draggable>
        </div>
    );
}

export default Login;