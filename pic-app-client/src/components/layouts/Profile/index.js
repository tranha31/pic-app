import { useLocation } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { profileRoutes } from "@/routes";
import MyCollection from './MyCollection';
import MyRequest from './MyRequest';

const cx = classNames.bind(styles);

function Profile({callBackUpdate, searchKey, isSearchData}) {

    const location = useLocation();
    var isDefault = false;

    return (
        <div className={cx('home-container', 'd-flex')}>
            <div className={cx('menu-bar', 'd-flex')}>
                {profileRoutes.map((router, index) => {
                    var isActive =  window.location.href.includes(router.path)
                    if(window.location.href.includes('/my_collection')){
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
            {isDefault ? <MyCollection callBackUpdate={callBackUpdate} searchKey={searchKey} isSearchData={isSearchData}/> : <MyRequest/>}
        </div>

    );
}

export default Profile;