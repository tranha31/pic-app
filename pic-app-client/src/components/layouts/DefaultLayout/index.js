import styles from './DefaultLayout.module.scss';
import classNames from 'classnames/bind';
import CopyrightAction from "@/components/views/CopyrightAction";
import { Fragment, useEffect, useState } from "react";
import Header from "./Header";
import Draggable from 'react-draggable';

const cx = classNames.bind(styles);

function DefaultLayout({children, callBackUpdateSearch, callBackFilterData, disableSearch}) {

    const [copyrightMode, setCopyrightMode] = useState(0);
    const [showCopyright, setShowCopyright] = useState(false);
    const [showNotify, setShowNotify] = useState(false);
    const [disabedSearchKey, setDisabedSearchKey] = useState(disableSearch);

    const handleCloseCopyright = (state) => {
        setShowCopyright(state)
    }

    const handleShowCopyright = (state) => {
        setCopyrightMode(state);
        setShowCopyright(true);
    }

    const handleCallBackUpdateSearch = (value, disable) => {
        callBackUpdateSearch(value, disable)
    }

    const handelCallBackFilterData = (value) => {
        callBackFilterData(value)
    }

    useEffect(()=>{
        setDisabedSearchKey(disableSearch)
    }, [disableSearch])


    return ( 
        <Fragment>
            <Header disableInputSearch={disabedSearchKey} callBackHandleCloseCopyright={handleShowCopyright} callBackUpdateSearch={handleCallBackUpdateSearch} callBackFilterData={handelCallBackFilterData}/>
            <div className="container" style={{position: "relative"}}>
                <div className="content">{children}</div>

                <Draggable bounds='parent'>
                    <div className={cx('notification-wrapper')}>
                        {showNotify && (
                            <div style={{position: "relative"}}>
                                <div className={cx('notification-content', 'd-flex', 'flex-column')}>
                                    <div className={cx('notify-header', 'd-flex', 'w-full')}>
                                        <div className={cx('flex-1')}></div>
                                        <div className={cx('close-notify')} onClick={() => {setShowNotify(false)}}></div>
                                    </div>
                                    <div className={cx('notify-content', 'flex-1')}>
                                        <div className={cx('d-flex', 'item-notify', 'w-full')}>
                                            <div className={cx('image')}></div>
                                            <div className={cx('message', 'flex-1')}>Your image is accepted</div>
                                        </div>
                                        <div className={cx('d-flex', 'item-notify', 'w-full')}>
                                            <div className={cx('image')}></div>
                                            <div className={cx('message', 'flex-1')}>Your image is accepted</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        )}

                        {!showNotify && (
                            <div className={cx('bell')} onClick={() => {setShowNotify(true)}}>
                                <div className={cx('new')}></div>
                            </div>
                        )}
                        
                        
                    </div>
                </Draggable>
                
            </div>
            {showCopyright && <CopyrightAction mode={copyrightMode} callBackEvent={handleCloseCopyright}/>}
            
        </Fragment>
     );
}

export default DefaultLayout;