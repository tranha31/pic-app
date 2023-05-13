import styles from './Home.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { homeRoutes } from "@/routes";
import { useLocation } from 'react-router-dom'
import Market from './Market';
// import Sell from './Sell';
import Auction from './Auction';
import { useEffect } from 'react';

const cx = classNames.bind(styles);

function Home({callBackUpdate, searchKey, isSearchData}) {
    const location = useLocation();
    var isDefault = false;

    useEffect(()=>{
        callBackUpdate(false)
    }, [])
    
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
            </div>
            {isDefault ? <Market/> : <Auction/>}
        </div>
    );
}

export default Home;