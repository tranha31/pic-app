import styles from './DefaultLayout.module.scss';
import classNames from 'classnames/bind';
import CopyrightAction from "@/components/views/CopyrightAction";
import { Fragment, useEffect, useState } from "react";
import Header from "./Header";
import Draggable from 'react-draggable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import NotificationAPI from '@/api/notification';
import Metamask from '@/api/metamask';
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function DefaultLayout({children, callBackUpdateSearch, callBackFilterData, disableSearch}) {
    const navigate = useNavigate();
    const [copyrightMode, setCopyrightMode] = useState(0);
    const [showCopyright, setShowCopyright] = useState(false);
    const [showNotify, setShowNotify] = useState(false);
    const [disabedSearchKey, setDisabedSearchKey] = useState(disableSearch);
    const [connection, setConnection] = useState(null);
    const [notification, setNotification] = useState([]);
    const [address, setAddress] = useState(null);
    const [userMessage, setUserMessage] = useState(null);

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

    const getNotification = async () => {
        try{
            var api = new NotificationAPI();
            var param = {
                userKey : address
            }
            var res = await api.getListNotification(param);
            if(res.data.success){
                var data = res.data.data;
                setNotification(...[])
                setNotification([...data]);
            }
        }
        catch(err){
            console.log(err)
        }
    }

    const getAddress = async () => {
        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(check){
            var address = await metamask.getAddress();
            address = address[0];
            setAddress(address.substring(2))
        }
    }

    const handleViewNotification = async (index) => {
        var data = notification;
        var item = data[index];
        await updateSeenNoti(item.infor.id);
        data[index].infor.status = 1;
        setNotification([...data]);
        
        if(item.infor.referenceLink){
            var url = "/" + item.infor.referenceLink + "?q=" + item.infor.type.toString();
            navigate(url);
        }
    }

    const updateSeenNoti = async (id) => {
        try{
            var api = new NotificationAPI();
            await api.updateSeenNotifi(id);
        }
        catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        getAddress();
    }, [])

    useEffect(() => {
        if(address){
            getNotification();
        }
    }, [address])

    useEffect(()=>{
        setDisabedSearchKey(disableSearch)
    }, [disableSearch])

    useEffect(() => {
        const connect = new HubConnectionBuilder()
            .withUrl(process.env.REACT_APP_PUSH_URL + "hubs/notification")
            .withAutomaticReconnect()
            .build();

        setConnection(connect);
    }, [])
    
    useEffect(() => {
        if (connection) {
          connection
            .start()
            .then(() => {
              connection.on("ReceiveMessage", (message) => {
                setUserMessage(message);
              });
            })
            .catch((error) => console.log(error));
        }
    }, [connection]);

    useEffect(() => {
        if(userMessage?.userKey === address){
            if(window.location.href.includes("my_request")){
                window.location.reload();
            }
            else{
                toast.info(userMessage?.message);
                getNotification();
            }
            
        }
    }, [userMessage])

    const handleShowNotify = () => {
        getNotification();
        setShowNotify(true)
    }

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
                                        {
                                            notification?.map((e, i) => {
                                                return (
                                                    <div key={i} className={cx('d-flex', 'item-notify', 'w-full', 'align-center')} onClick={() => {handleViewNotification(i)}}>
                                                        {e.image && <div className={cx('image')} style={{backgroundImage: "url('"+e.image+"')"}}></div>}
                                                        <div className={cx('message', 'flex-1', e.infor.status === 1 ? 'active' : '')}>{e.infor.content}</div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                            
                        )}

                        {!showNotify && (
                            <div className={cx('bell')} onClick={() => {handleShowNotify()}}>
                                <div className={cx('new')}></div>
                            </div>
                        )}
                        
                        
                    </div>
                </Draggable>
                
            </div>
            {showCopyright && <CopyrightAction mode={copyrightMode} callBackEvent={handleCloseCopyright}/>}
            <ToastContainer/>
        </Fragment>
     );
}

export default DefaultLayout;