import { Fragment, useEffect, useState } from 'react';
import styles from './MyRequest.module.scss';
import classNames from 'classnames/bind';
import Button from '@/components/base/Button';
import logo from "../../../../assets/imgs/processing.gif";
import reject from "../../../../assets/imgs/reject.png"
import MessageBox from '@/components/base/MessageBox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tippy from '@tippyjs/react/headless';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import CollectionAPI from '@/api/collection';
import Metamask from '@/api/metamask';
import Loading from '@/components/base/Loading';

const cx = classNames.bind(styles);

function MyRequest() {

    const [tab, setTab] = useState(0);
    const [title, setTitle] = useState("Warning");
    const [message, setMessage] = useState("Are you sure you want to send an appeal?")
    const [showMessage, setShowMessage] = useState(false);
    const [paramRequestStatus, setParamRequestStatus] = useState(-1);
    const [curIndex, setCurIndex] = useState(0);
    const [registerRequests, setRegisterRequests] = useState([]);
    const [statusReq, setStatusReq] = useState({value: -1, label: 'All'}) 

    const requestStatus = [
        {value: -1, label: 'All'},
        { value: 0, label: 'Processing' },
        { value: 2, label: 'Rejected' },
    ];

    const [showFilter, setShowFilter] = useState(false);

    var curDate = new Date();
    
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [showLoading, setShowLoading] = useState(false);

    const submitBtn = (
        <Button primary onClick={() => {handleSubmitRequest()}}>Submit</Button>
    )

    useEffect(() => {
        getInitData();
    }, []);

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(tab === 0){
            if(data !== false){
                setRegisterRequests([...data])
            }
        }
        else{

        }
    }

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

    const handleChangeRequestStatus = (v) => {
        setStatusReq(v);
        setParamRequestStatus(v.value);

    }

    const refreshFilter = () => {
        var curDate = new Date();
        setStartDate(new Date(curDate.setDate(curDate.getDate() - 30)))
        setEndDate(new Date())

        setStatusReq(requestStatus[0]);
        setParamRequestStatus(-1);
    }

    const filterData = async () => {
        setShowFilter(false);
        setCurIndex(0);
        setRegisterRequests([...[]]);
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setRegisterRequests([...data])
            }
            
        }
    }

    const loadMoreData = async () => {
        var index = curIndex + 20;
        setCurIndex(index);
        if(tab === 0){
            var curData = registerRequests;
            setRegisterRequests([...[]]);
            var data = await handlePagingData(index);
            if(data !== false){
                var merData = [...curData, ...data]
                setRegisterRequests([...merData])
            }
        }

    }

    const handlePagingData = async (index) => {
        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(!check){
            toast.warning("Install metamask extension!");
            return;
        }

        try{
            var address = await metamask.getAddress();
            address = address[0];
            address = address.substring(2);

            if(tab === 0){
                return handleGetRegisterRequest(index, address);
            }
            else{
    
            }

        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
        
    }

    const handleGetRegisterRequest = async (index, address) => {
        setShowLoading(true);
        const api = new CollectionAPI();
        var param = {
            key: address,
            start : index,
            length : 20,
            status : paramRequestStatus,
            fromDate: startDate,
            toDate: endDate,
        }
        
        var res = await api.getRegisterRequestPaging(param);
        if(res.data.success){
            var data = res.data.data;
            var registers = convertDataRegisterRequest(data);
            setShowLoading(false);
            return registers;
        }
        else{
            setShowLoading(false);
            toast.error("Something wrong! Please try again!")
            return false;
        }
    }

    const convertDataRegisterRequest = (data) => {
        var registers = data.map((e, i) => {
            var contentImage = "url('data:image/png;base64," + e.imageContent + "')"; 
            return {
                "status" : e.status,
                "active" : false,
                "image" : contentImage
            }
        })

        return registers;
    }

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Registration request</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Request an appeal</div>
                <div className={cx('flex-1')}></div>

                <Tippy
                    visible={showFilter}
                    interactive
                    placement="bottom"
                    hideOnClick={false}
                    offset={0}
                    render={attrs => (
                        <div className={cx('filter-box', 'd-flex', 'flex-column')} tabIndex="-1" {...attrs}>
                            <div className={cx('filter-header', 'd-flex', 'mb-8')}>
                                <div className={cx('icon-filter')}></div>
                                <div className={cx('font-bold', 'font-size-18')}>Filter</div>
                            </div>
                            <div className={cx('filter-content', 'd-flex', 'flex-column', 'flex-1')}>
                                <div className={cx('d-flex', 'w-full', 'mb-8')}>
                                    <div className={cx('date-picker-wrapper', 'mr-8', 'w-half')}>
                                        <p className={cx('title-date-picker', 'font-bold')}>From date</p>
                                        <DatePicker 
                                            className={cx('date-picker', 'w-full')} 
                                            dateFormat="dd/MM/yyyy" 
                                            selected={startDate} 
                                            onChange={(date) => setStartDate(date)} 
                                        />
                                    </div>

                                    <div className={cx('date-picker-wrapper', 'w-half')}>
                                        <p className={cx('title-date-picker', 'font-bold')}>To date</p>
                                        <DatePicker 
                                            className={cx('date-picker', 'w-full')} 
                                            dateFormat="dd/MM/yyyy" 
                                            selected={endDate} 
                                            onChange={(date) => setEndDate(date)} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={cx('font-bold', 'mb-8')}>Request status</div>
                                    <Select 
                                        options={requestStatus} 
                                        isSearchable={false}
                                        defaultValue={requestStatus[0]}
                                        value={statusReq}
                                        menuPlacement='auto'
                                        onChange={(v) => handleChangeRequestStatus(v)}
                                    />
                                </div>
                            </div>

                            <div className={cx('d-flex', 'w-full')}>
                                <div className={cx('flex-1')}></div>
                                <Button normal onClick={() => {setShowFilter(false)}}>Close</Button>
                                <Button normal onClick={() => {refreshFilter()}}>Refresh</Button>
                                <Button primary onClick={() => {filterData()}}>OK</Button>
                            </div>
                        </div>
                    )}
                >
                    <div className={cx('filter')} onClick={() => {setShowFilter(true)}}></div>
                </Tippy>
                
            </div>

            <div className={cx('collection-content', 'd-flex', 'flex-column', 'flex-1')}>
                { tab == 0 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                {
                                    registerRequests.length > 0 ? 
                                    (
                                        registerRequests.map((e, index) => {
                                            return (
                                                <div key={index} className={cx('content-image', e.active ? 'active' : '')} title='Processing' style={{backgroundImage: e.image}}>
                                                    {e.status === 0 && <img src={logo} className={cx('processing')} alt="loading..." />}
                                                    {e.status === 2 && <img src={reject} className={cx('processing')} alt="loading..." />}
                                                </div>
                                            )
                                        })
                                    ) 
                                    : 
                                    (
                                        <div className={cx('empty-data', 'd-flex', 'flex-1', 'flex-column', 'align-center', 'justify-center')}>
                                            <div className={cx('i-empty')}></div>
                                            <div className={cx('font-bold', 'font-size-18')}>No data</div>
                                        </div>
                                    )
                                }

                                
                            </div>
                        </div>

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full')}>
                            <div className={cx('flex-1')}></div>
                            <Button normal onClick={() => loadMoreData()}>See more</Button>
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
            {showLoading && <Loading />}
        </div>
    );
}

export default MyRequest;