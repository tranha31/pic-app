import { useLocation } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { profileRoutes } from "@/routes";
import MyCollection from './MyCollection';
import MyRequest from './MyRequest';

const cx = classNames.bind(styles);

function Profile() {

    const location = useLocation();
    var isDefault = false;

    return (
        <div className={cx('home-container', 'd-flex')}>
            <div className={cx('menu-bar', 'd-flex')}>
                {profileRoutes.map((router, index) => {
                    var isActive = location.pathname == router.path
                    if(location.pathname == '/my_collection'){
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
            </div>
            {isDefault ? <MyCollection/> : <MyRequest/>}
        </div>

    );
}

export default Profile;