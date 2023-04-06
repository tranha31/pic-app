import { Fragment, useState } from 'react';
import styles from './MyRequest.module.scss';
import classNames from 'classnames/bind';
import Button from '@/components/base/Button';
import logo from "../../../../assets/imgs/processing.gif";
import reject from "../../../../assets/imgs/reject.png"
import MessageBox from '@/components/base/MessageBox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function MyRequest() {

    const [tab, setTab] = useState(0);
    const [title, setTitle] = useState("Warning");
    const [message, setMessage] = useState("Are you sure you want to send an appeal?")
    const [showMessage, setShowMessage] = useState(false);

    const submitBtn = (
        <Button primary onClick={() => {handleSubmitRequest()}}>Submit</Button>
    )

    const closePopup = (status) => {
        setShowMessage(false);
    }

    const goToTab = (index) => {
        setTab(index);
    }

    const handleSubmitRequest = () => {
        setShowMessage(false);
        toast.success("Send request success!")
    }

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Registration request</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Request an appeal</div>
            </div>

            <div className={cx('collection-content', 'd-flex', 'flex-column', 'flex-1')}>
                { tab == 0 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                <div className={cx('content-image')} title='Processing'>
                                    <img src={logo} className={cx('processing')} alt="loading..." />
                                </div>
                                <div className={cx('content-image', 'active')}>
                                    <img src={reject} className={cx('processing')} alt="loading..." />
                                </div>
                            </div>
                        </div>

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full')}>
                            <div className={cx('flex-1')}></div>
                            <Button normal>See more</Button>
                            <Button primary onClick={() => {setShowMessage(true)}}>Submit appeal</Button>
                        </div>
                        {showMessage && <MessageBox type={"warning"} title={title} message={message} scale={{height: "200px", width: "450px"}} child={submitBtn} eventCallBack={closePopup}/>}
                        
                    </Fragment>
                    
                )}

                { tab == 1 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                <div className={cx('content-image')} title='Processing'>
                                    <img src={logo} className={cx('processing')} alt="loading..." />
                                </div>
                                <div className={cx('content-image')} title='Rejected'>
                                    <img src={logo} className={cx('processing')} />
                                </div>
                            </div>
                        </div>

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full')}>
                            <div className={cx('flex-1')}></div>
                            <Button primary>See more</Button>
                        </div>
                    </Fragment>
                    
                )}
            </div>        
            <ToastContainer/>
        </div>
    );
}

export default MyRequest;