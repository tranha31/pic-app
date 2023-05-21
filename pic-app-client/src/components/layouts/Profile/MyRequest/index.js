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
import CopyrightAPI from '@/api/copyright';
import Metamask from '@/api/metamask';
import Loading from '@/components/base/Loading';
import PopupDetail from '@/components/base/PopupDetail';

const cx = classNames.bind(styles);

function MyRequest() {

    const [tab, setTab] = useState(0);
    const [title, setTitle] = useState("Warning");
    const [message, setMessage] = useState("We only send rejected image requests due to similarity. Are you sure you want to send an appeal?")
    const [showMessage, setShowMessage] = useState(false);
    const [paramRequestStatus, setParamRequestStatus] = useState(-1);
    const [curIndex, setCurIndex] = useState(0);
    const [registerRequests, setRegisterRequests] = useState([]);
    const [appealRequests, setAppealRequests] = useState([]);
    const [curAppealIndex, setCurAppealIndex] = useState(0);
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


    const [showFilterAppeal, setShowFilterAppeal] = useState(false);
    const [startDateAppeal, setStartDateAppeal] = useState(new Date(curDate));
    const [endDateAppeal, setEndDateAppeal] = useState(new Date());

    const [showLoading, setShowLoading] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showBoxReject, setShowBoxReject] = useState(false);
    const [messageReject, setMessageReject] = useState("");
    const [imageSimilar, setImageSimilar] = useState();
    const [imageSimilars, setImageSimilars] = useState([]);
    const [selectedItem, setSelectedItem] = useState([]);
    const [currentID, setCurrentID] = useState("");
    const [selectedAppeal, setSelectedAppeal] = useState([]);

    const submitBtn = (
        <Button primary onClick={() => {handleSubmitRequest()}}>Submit</Button>
    )

    const viewReject = (
        <div className={cx('detail-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('content', 'd-flex', 'flex-1')}>
                <div className={cx('flex-1', 'd-flex', 'wrapper-content', 'align-center', 'justify-center', 'flex-column')} style={{marginRight: "15px"}}>
                    <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "15px"}}>Requested image</div>
                    <div className={cx('image-request')} style={{backgroundImage: imageSimilar}}></div>
                </div>
                <div className={cx('flex-2', 'd-flex', 'flex-column', 'wrapper-content')}>
                    <div className={cx('font-bold', 'font-size-18')}>Similar images</div>
                    <div className={cx('flex-1', 'd-flex', 'image-similar')}>
                        {
                            imageSimilars.map((e, index) => {
                                return <div key={index} className={cx('item-similar')} style={{backgroundImage: "url('" + e + "')"}}></div>
                            })
                        }

                    </div>
                </div>
            </div>
            <div className={cx('footer', 'd-flex', 'w-full')} style={{padding: "10px 0px"}}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => setShowDetail(false)}>Close</Button>
                {tab === 0 && <Button normal onClick={() => deleteRequestInForm()}>Delete</Button>}
                {tab === 0 && <Button primary onClick={() => sendAppealRequestInForm()}>Submit appeal</Button>}
            </div>
        </div>
    )

    useEffect(() => {
        getInitData();
    }, []);

    useEffect(() => {
        if(tab === 0 && registerRequests.length === 0){
            handleRefresh();
        }
        else if(tab === 1 && appealRequests.length === 0){
            handleRefresh();
        }

        setShowFilter(false);
        setShowFilterAppeal(false);
    }, [tab])

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setRegisterRequests([...data])
            }
            else{
                setAppealRequests([...data])
            }
        }
        
    }

    const closePopup = (status) => {
        setShowMessage(false);
    }

    const goToTab = (index) => {
        setTab(index);
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

    const refreshFilterAppeal = () => {
        var curDate = new Date();
        setStartDateAppeal(new Date(curDate.setDate(curDate.getDate() - 30)))
        setEndDateAppeal(new Date())
    }

    const filterData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setImageSimilar("");
                setImageSimilars([...[]])
                setCurrentID("")
                setSelectedAppeal([...[]])
                setSelectedItem([...[]])
                setCurIndex(0);
                setRegisterRequests([...[]]);
                setRegisterRequests([...data])
                setShowFilter(false);
            }
            else{
                setShowFilterAppeal(false);
                setCurAppealIndex(0);
                setAppealRequests([...[]]);
                setAppealRequests([...data]);
            }
        }
        
    }

    const handleRefresh = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setImageSimilar("");
                setImageSimilars([...[]])
                setCurrentID("")
                setSelectedAppeal([...[]])
                setSelectedItem([...[]])
                setRegisterRequests([...data])
                setCurIndex(0)
            }
            else{
                setAppealRequests([...data])
                setCurAppealIndex(0)
            }
        }
    }

    const loadMoreData = async () => {
        if(tab === 0){
            var index = curIndex + 20;
            setCurIndex(index);
            var curData = registerRequests;
            var data = await handlePagingData(index);
            if(data !== false){
                var merData = [...curData, ...data]
                setRegisterRequests([...merData])
            }
        }
        else{
            index = curAppealIndex + 20;
            setCurAppealIndex(index);
            curData = appealRequests;
            data = await handlePagingData(index);
            if(data !== false){
                var merData = [...curData, ...data]
                setAppealRequests([...merData])
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
                return handleGetAppealRequest(index, address);
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
        var fromDate = new Date(startDate)
        var toDate = new Date(endDate)
        var param = {
            key: address,
            start : index,
            length : 20,
            status : paramRequestStatus,
            fromDate: new Date(fromDate.setHours(0,0,0,0)),
            toDate: new Date(toDate.setHours(23,59,59,1000)),
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
                "id": e.refID,
                "status" : e.status,
                "image" : contentImage,
                "error": e.error
            }
        })

        return registers;
    }

    const handleGetAppealRequest = async (index, address) => {
        setShowLoading(true);
        const api = new CollectionAPI();
        var fromDate = new Date(startDateAppeal)
        var toDate = new Date(endDateAppeal)
        var param = {
            key: address,
            start : index,
            length : 20,
            fromDate: new Date(fromDate.setHours(0,0,0,0)),
            toDate: new Date(toDate.setHours(23,59,59,1000)),
        }
        
        var res = await api.getAppealRequestPaging(param);
        if(res.data.success){
            var data = res.data.data;
            var registers = convertDataAppealRequest(data);
            setShowLoading(false);
            return registers;
        }
        else{
            setShowLoading(false);
            toast.error("Something wrong! Please try again!")
            return false;
        }
    }

    const convertDataAppealRequest = (data) => {
        var appeals = data.map((e, i) => {
            var contentImage = "url('data:image/png;base64," + e.imageContent + "')"; 
            return {
                "id": e.refID,
                "image" : contentImage,
                "error": "Image has similar"
            }
        })

        return appeals;
    }

    const hanldeViewDetailReject = async (id, error, status, image) => {
        if(status === 0) {return;}
        if(error === "Image has similar"){
            try{
                setShowLoading(true);
                const api = new CollectionAPI();
                var param = {
                    id: id,
                }
                
                var res = await api.getImageSimilar(param);
                if(res.data.success){
                    var data = res.data.data;
                    setImageSimilar(image);
                    setImageSimilars([...[]]);
                    setImageSimilars([...data]);
                    setCurrentID(id);
                    setShowDetail(true);
                }
                else{
                    toast.error("Something wrong! Please try again!")
                }

                setShowLoading(false);
            }
            catch(err){
                toast.warning("Something wrong! Please try again!");
            }
        }
        else{
            setMessageReject(error);
            setShowBoxReject(true);
        }
    }

    const handleChooseRequest = (id, status, error) => {
        if(status === 0){
            return;
        }
        else{
            var index = selectedItem.indexOf(id);
            var temp = selectedItem;
            if(index > -1){
                temp.splice(index, 1);
            }
            else{
                temp.push(id);
            }
            setSelectedItem([...[]]);
            setSelectedItem([...temp]);

            if(error === "Image has similar"){
                index = selectedAppeal.indexOf(id);
                temp = selectedAppeal;
                if(index > -1){
                    temp.splice(index, 1);
                }
                else{
                    temp.push(id);
                }
                setSelectedAppeal([...[]]);
                setSelectedAppeal([...temp]);
            }
        }
    }

    const deleteRequest = async () => {
        var ids = "";
        for(var i=0; i<selectedItem.length; i++){
            ids = ids + selectedItem[i] + ";"
        }

        ids = ids.substring(0, ids.length - 1);

        try {
            const api = new CopyrightAPI();
            var param = {
                id: ids,
            }
            
            var res = await api.deleteRequestReject(param);
            if(res.data.success){
                setSelectedItem([...[]]);
                setSelectedAppeal([...[]]);
                var temp = registerRequests;
                temp = temp.filter((e, ind) => {
                    return !ids.includes(e.id);
                })
                setRegisterRequests([...temp]);
                toast.success("Delete request success!");
            }
        } catch (error) {
            toast.warning("Something wrong! Please try again!");
        }
    }

    const deleteRequestInForm = async () => {
        try {
            const api = new CopyrightAPI();
            var param = {
                id: currentID,
            }
            
            var res = await api.deleteRequestReject(param);
            if(res.data.success){
                var tempSeleted = selectedItem;
                var indexSelected = tempSeleted.indexOf(currentID);
                if(indexSelected > -1){
                    tempSeleted.splice(indexSelected, 1);
                }
                setSelectedItem([...tempSeleted]);

                tempSeleted = selectedAppeal;
                indexSelected = tempSeleted.indexOf(currentID);
                if(indexSelected > -1){
                    tempSeleted.splice(indexSelected, 1);
                }
                setSelectedAppeal([...tempSeleted]);

                var temp = registerRequests;
                temp = temp.filter((e, ind) => {
                    return e.id != currentID;
                })
                setRegisterRequests([...temp]);
                handleCallBackDetailReject();
                toast.success("Delete request success!");
            }
        } catch (error) {
            toast.warning("Something wrong! Please try again!");
        }
    }

    const handleSubmitRequest = async () => {
        setShowMessage(false);
        var ids = "";
        for(var i=0; i<selectedAppeal.length; i++){
            ids = ids + selectedAppeal[i] + ";"
        }

        ids = ids.substring(0, ids.length - 1);

        try {
            const api = new CopyrightAPI();
            var param = {
                id: ids,
            }
            
            var res = await api.sendAppealRequest(param);
            if(res.data.success){
                setSelectedAppeal([...[]]);

                var tempSeleted = selectedItem;
                tempSeleted = tempSeleted.filter((e, ind) => {
                    return !ids.includes(e);
                })
                setSelectedItem([...tempSeleted]);

                var temp = registerRequests;
                temp = temp.filter((e, ind) => {
                    return !ids.includes(e.id);
                })
                setRegisterRequests([...temp]);
                toast.success("Send request success!");
            }
        } catch (error) {
            toast.warning("Something wrong! Please try again!");
        }
    }

    const sendAppealRequestInForm = async () => {
        try {
            const api = new CopyrightAPI();
            var param = {
                id: currentID,
            }
            
            var res = await api.sendAppealRequest(param);
            if(res.data.success){
                var tempSeleted = selectedItem;
                var indexSelected = tempSeleted.indexOf(currentID);
                if(indexSelected > -1){
                    tempSeleted.splice(indexSelected, 1);
                }
                setSelectedItem([...tempSeleted]);

                tempSeleted = selectedAppeal;
                indexSelected = tempSeleted.indexOf(currentID);
                if(indexSelected > -1){
                    tempSeleted.splice(indexSelected, 1);
                }
                setSelectedAppeal([...tempSeleted]);

                var temp = registerRequests;
                temp = temp.filter((e, ind) => {
                    return e.id != currentID;
                })
                setRegisterRequests([...temp]);
                handleCallBackDetailReject();
                toast.success("Send request success!");
            }
        } catch (error) {
            toast.warning("Something wrong! Please try again!");
        }
    }

    const handleCallBackDetailReject = (state) => {
        setImageSimilar("");
        setImageSimilars([...[]])
        setCurrentID("")
        setShowDetail(false)
    }

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Registration request</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Request an appeal</div>
                <div className={cx('flex-1')}></div>
                {tab === 0 && (
                    <div className={cx('d-flex', 'align-center', 'mr-8')}>From: {new Date(startDate).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)} - To: {new Date(endDate).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)}</div>
                )}
                {tab === 1 && (
                    <div className={cx('d-flex', 'align-center', 'mr-8')}>From: {new Date(startDateAppeal).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)} - To: {new Date(endDateAppeal).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)}</div>
                )}
                <div className={cx('refresh')} onClick={() => {handleRefresh()}} id={"reload-request"}></div>
                {tab == 0 ? (
                    <Tippy
                        visible={showFilter}
                        interactive
                        placement="bottom"
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
                                                showYearDropdown
                                                yearDropdownItemNumber={15}
                                                scrollableYearDropdown
                                                onChange={(date) => setStartDate(date)} 
                                                onBlur={() => {if(!startDate){setStartDate(new Date())}}}
                                            />
                                        </div>

                                        <div className={cx('date-picker-wrapper', 'w-half')}>
                                            <p className={cx('title-date-picker', 'font-bold')}>To date</p>
                                            <DatePicker 
                                                className={cx('date-picker', 'w-full')} 
                                                dateFormat="dd/MM/yyyy" 
                                                selected={endDate} 
                                                showYearDropdown
                                                yearDropdownItemNumber={15}
                                                scrollableYearDropdown
                                                onChange={(date) => setEndDate(date)} 
                                                onBlur={() => {if(!endDate){setEndDate(new Date())}}}
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
                ) : (
                    <Tippy
                        visible={showFilterAppeal}
                        interactive
                        placement="bottom"
                        offset={0}
                        render={attrs => (
                            <div className={cx('filter-box', 'filter-appeal', 'd-flex', 'flex-column')} tabIndex="-1" {...attrs}>
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
                                                selected={startDateAppeal} 
                                                showYearDropdown
                                                yearDropdownItemNumber={15}
                                                scrollableYearDropdown
                                                onChange={(date) => setStartDateAppeal(date)} 
                                                onBlur={() => {if(!startDateAppeal){setStartDateAppeal(new Date())}}}
                                            />
                                        </div>

                                        <div className={cx('date-picker-wrapper', 'w-half')}>
                                            <p className={cx('title-date-picker', 'font-bold')}>To date</p>
                                            <DatePicker 
                                                className={cx('date-picker', 'w-full')} 
                                                dateFormat="dd/MM/yyyy" 
                                                selected={endDateAppeal} 
                                                showYearDropdown
                                                yearDropdownItemNumber={15}
                                                scrollableYearDropdown
                                                onChange={(date) => setEndDateAppeal(date)} 
                                                onBlur={() => {if(!endDateAppeal){setEndDateAppeal(new Date())}}}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('d-flex', 'w-full')}>
                                    <div className={cx('flex-1')}></div>
                                    <Button normal onClick={() => {setShowFilterAppeal(false)}}>Close</Button>
                                    <Button normal onClick={() => {refreshFilterAppeal()}}>Refresh</Button>
                                    <Button primary onClick={() => {filterData()}}>OK</Button>
                                </div>
                            </div>
                        )}
                    >
                        <div className={cx('filter')} onClick={() => {setShowFilterAppeal(true)}}></div>
                    </Tippy>
                )}
                
                
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
                                                <div key={index} className={cx('content-image', selectedItem.indexOf(e.id) > -1 ? 'active' : '')} style={{backgroundImage: e.image}}
                                                onDoubleClick={() => {hanldeViewDetailReject(e.id, e.error, e.status, e.image)}}
                                                onClick={() => {handleChooseRequest(e.id, e.status, e.error)}}
                                                >
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

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full', 'align-center')}>
                            <div className={cx('flex-1', 'font-bold', 'underline', 'font-italic', 'pl-10')}>Click duplex on rejected request to see detail</div>
                            <Button normal onClick={() => loadMoreData()}>See more</Button>
                            {selectedItem.length > 0 && <Button normal onClick={() => {deleteRequest()}}>Delete</Button>}
                            {selectedAppeal.length > 0 && <Button primary onClick={() => {setShowMessage(true)}}>Submit appeal</Button>}
                            
                        </div>
                        {showMessage && <MessageBox type={"warning"} title={title} message={message} scale={{height: "200px", width: "450px"}} child={submitBtn} eventCallBack={closePopup}/>}
                        
                    </Fragment>
                    
                )}

                { tab == 1 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                {
                                    appealRequests.length > 0 ? 
                                    (
                                        appealRequests.map((e, index) => {
                                            return (
                                                <div key={index} className={cx('content-image')} title='Processing' style={{backgroundImage: e.image}}
                                                    onDoubleClick={() => {hanldeViewDetailReject(e.id, e.error, 2, e.image)}}
                                                >
                                                    <img src={logo} className={cx('processing')} alt="loading..." />
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

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full', 'align-center')}>
                            <div className={cx('flex-1', 'font-bold', 'underline', 'font-italic', 'pl-10')}>Click duplex on rejected request to see detail</div>
                            <Button normal onClick={() => loadMoreData()}>See more</Button>
                        </div>
                    </Fragment>
                    
                )}
            </div>
            {showBoxReject && <MessageBox title={"Reason for reject"} message={messageReject} scale={{height: "200px", width: "450px"}} eventCallBack={() => {setShowBoxReject(false)}}/>}
            {showDetail && <PopupDetail title={"Request detail"} scale={{height: "95%", width: "85%"}} child={viewReject} eventCallBack={handleCallBackDetailReject}/>}        
            <ToastContainer/>
            {showLoading && <Loading />}
        </div>
    );
}

export default MyRequest;