import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import { headerRoutes } from "@/routes";
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';
import Button from '@/components/base/Button';

const cx = classNames.bind(styles);

function Header() {

    return (
        <div className={cx('header', 'd-flex')}>
            <div className={cx('logo')}></div>
            <div className={cx('menu-box', 'd-flex', 'flex-column')}>
                <div className={cx('search-box', 'd-flex')}>
                    <div className={cx('search-icon')}></div>
                    <input className={cx('search-input')} />
                    <div className={cx('search-delete', 'd-none')}>x</div>
                </div>
                <div className={cx('nav-bar', 'd-flex')}>
                    {headerRoutes.map((router, index) => {
                        return (
                            <Link to={router.path} key={index} className={cx('menu-item')}>{router.name}</Link>
                        );  
                    })
                    }
                </div>
                <Tippy
                    interactive
                    placement="bottom"
                    hideOnClick={false}
                    offset={0}
                    render={attrs => (
                        <div className={cx('small-menu-tippy', 'd-flex', 'flex-column')} tabIndex="-1" {...attrs}>
                            {headerRoutes.map((router, index) => {
                                return (
                                    <Link to={router.path} key={index} className={cx('menu-item-tippy')}>{router.name}</Link>
                                );  
                            })
                            }
                        </div>
                    )}
                >
                    <div className={cx('small-nav-bar', 'd-none')}>
                    </div>
                </Tippy>
            </div>

            <div className={cx('user-option', 'flex-1')}>
                <div className={cx('btn-desktop')}>
                    <Button className={cx('login-btn')} primary>Login</Button>
                    <Button className={cx('logout-btn', 'd-none')} normal>Logout</Button>
                </div>
                <div className={cx('btn-mobi')}>
                    <Button className={cx('login-btn-small')} small primary>Login</Button>
                    <Button className={cx('logout-btn-small', 'd-none')} small normal>Logout</Button>
                </div>
            </div>
        </div>
    );
}

export default Header;