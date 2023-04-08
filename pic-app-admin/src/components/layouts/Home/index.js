import styles from './Home.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { homeRoutes } from "../../../routes";
import { useLocation } from 'react-router-dom'
import AppealRequest from './AppealRequest';
import Signature from './Signature';

const cx = classNames.bind(styles);

function Home() {
    const location = useLocation();
    var isDefault = false;
    
    return (
        <div className={cx('home-container', 'd-flex')}>
            <div className={cx('menu-bar', 'd-flex')}>
                {homeRoutes.map((router, index) => {
                    var isActive = location.pathname == router.path
                    if(location.pathname == '/'){
                        isDefault = true;
                    }
                    return (
                        <Link to={router.path} key={index} className={cx('menu-item', isActive ? 'active': '')}>
                            <div className={cx('icon', router.name)}></div>
                            <div className={cx('item')}>{router.name}</div>
                        </Link>
                        
                        );  
                    })
                }
                <div className={cx('flex-1')}></div>
                <div className={cx('menu-item')}>
                    <div className={cx('icon', 'Logout')}></div>
                    <div className={cx('item')}>Logout</div>
                </div>
            </div>
            {isDefault ? <Signature/> : <AppealRequest/>}
        </div>
    );
}

export default Home;