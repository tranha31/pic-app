import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import { headerRoutes, homeRoutes, profileRoutes } from "@/routes";
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react/headless';
import Button from '@/components/base/Button';
import { useLocation } from 'react-router-dom'

const cx = classNames.bind(styles);

function Header({callBackHandleCloseCopyright}) {

    const location = useLocation();

    const handleCloseCopyright = (mode) => {
        callBackHandleCloseCopyright(mode);
    }
    const lstDisableSearch = ["sell", "auction", "my_collection", "my_request"];
    const disabledSearch = lstDisableSearch.filter((e) => { return location.pathname.includes(e)}).length > 0 ? true : false;

    const routeInHome = homeRoutes.filter(e => { return e.path == location.pathname }).length > 0
    const routeInProfile = profileRoutes.filter(e => { return e.path == location.pathname }).length > 0

    return (
        <div className={cx('header', 'd-flex')}>
            <div className={cx('logo')}></div>
            <div className={cx('menu-box', 'd-flex', 'flex-column')}>
                <div className={cx('search-box', 'd-flex', disabledSearch ? 'disabled' : '')}>
                    <div className={cx('search-icon')}></div>
                    <input className={cx('search-input')} disabled={disabledSearch ? "disabled" : ""}/>
                    <div className={cx('search-delete', 'd-none')}>x</div>
                </div>
                <div className={cx('nav-bar', 'd-flex')}>
                    {headerRoutes.map((router, index) => {
                        var isActive = false;
                        if(router.path == "/" && routeInHome){
                            isActive = true;
                        }
                        else if(router.path == "/my_collection" && routeInProfile){
                            isActive = true;
                        }
                        else if(location.pathname == router.path){
                            isActive = true;
                        }

                        return (
                            <Link to={router.path} key={index} className={cx('menu-item', isActive ? 'active' : '')}>{router.name}</Link>
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
                                var isActive = location.pathname == router.path
                                return (
                                    <Link to={router.path} key={index} className={cx('menu-item-tippy', isActive ? 'active' : '')}>{router.name}</Link>
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
                    <Button className={cx('login-btn')} primary onClick={() => {handleCloseCopyright(0);}}>Copyright registration</Button>
                    <Button className={cx('logout-btn')} normal onClick={() => {handleCloseCopyright(1);}}>Check copyright</Button>
                </div>
                <div className={cx('btn-mobi')}>
                    <Button className={cx('login-btn-small')} small normal onClick={() => {handleCloseCopyright(0);}}>Copyright registration</Button>
                    <Button className={cx('logout-btn-small')} small normal onClick={() => {handleCloseCopyright(1);}}>Check copyright</Button>
                </div>
            </div>
        </div>
    );
}

export default Header;