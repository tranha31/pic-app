import { useEffect, useState } from 'react';
import Navigation from '../../../base/Navigation';
import styles from './AppealRequest.module.scss';
import classNames from 'classnames/bind';
import DatePicker from "react-datepicker";
import Button from '../../../base/Button';
import PopupDetail from '../../../base/PopupDetail';
import { ToastContainer, toast } from 'react-toastify';
import Loading from '../../../base/Loading';
import CollectionAPI from '../../../../api/collection';
import CopyrightAPI from '../../../../api/copyright';
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import MessageBox from '../../../base/MessageBox';

const cx = classNames.bind(styles);

function AppealRequest() {

    const [numberPerPage, setNumberPerPage] = useState({ value: '30', label: '30' })
    var curDate = new Date();
    
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());

    const [showDetail, setShowDetail] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showLoading, setShowLoading] = useState(false)

    const [appealRequest, setAppealRequest] = useState([])
    const [totalRecord, setTotalRecord] = useState(0);

    const [requestImage, setRequestImage] = useState("");
    const [imageSimilars, setImageSimilars] = useState([]);
    const [currentID, setCurrentID] = useState("");
    const [currentUser, setCurrentUser] = useState("");

    const [showMessasgeBox, setShowMessasgeBox] = useState(false)
    const [title, setTitle] = useState("Warning");
    const [message, setMessage] = useState("Are you sure you want to accept a request?")

    const changePage = async (obj) => {
        if(obj.type == 0){
            setNumberPerPage(obj.value)
            var count = Number.parseInt(obj.value.value);
            var data = await handleGetData(currentIndex, count);
            if(data){
                setAppealRequest([...data])
            }
        }
        else{
            var curPage = obj.value;
            count = Number.parseInt(numberPerPage.value)
            var index = curPage * count;
            setCurrentIndex(index);
            data = await handleGetData(index, count);
            if(data){
                setAppealRequest([...data])
            }
        }
    }

    const eventCallBack = (state) => {
        setRequestImage("")
        setImageSimilars([...[]])
        setCurrentID("")
        setCurrentUser("")
        setShowDetail(false)
    }

    useEffect(() =>{
        initData();
    }, [])

    const initData = async () => {
        var data = await handleGetData(0, 30)
        if(data){
            setAppealRequest([...data])
        }
    }

    const filter = async () => {
        var count = Number.parseInt(numberPerPage.value)
        var data = await handleGetData(currentIndex, count);
        if(data){
            setAppealRequest([...data])
        }
    }

    const handleGetData = async (index, count) => {
        setShowLoading(true);
        const api = new CollectionAPI();
        var param = {
            start : index,
            length : count,
            fromDate: new Date(startDate.setHours(0,0,0,0)),
            toDate: new Date(endDate.setHours(23,59,59,1000)),
        }
        
        var res = await api.getAllAppealRequestPaging(param);
        if(res.data.success){
            var data = res.data.data.data;
            var registers = convertDataAppealRequest(data);

            var totalR = res.data.data.totalRecord;
            setTotalRecord(totalR);

            setShowLoading(false);
            return registers;
        }
        else{
            setShowLoading(false);
            toast.error("Something wrong! Please try again!")
            return null;
        }
    }

    const convertDataAppealRequest = (data) => {
        var appeals = data.map((e, i) => {
            var contentImage = "url('data:image/png;base64," + e.imageContent + "')"; 
            var date = new Date(e.createdDate).toLocaleDateString('en-GB');
            return {
                "id": e.refID,
                "user": "0x" + e.userPublicKey,
                "image" : contentImage,
                "createdDate": date
            }
        })

        return appeals;
    }

    const handleViewRequest = async (id) => {
        var item = appealRequest.find((e, i) => {
            return e.id === id;
        })

        try{
            setShowLoading(true);
            const api = new CollectionAPI();
            var param = {
                id: id,
            }
            
            var res = await api.getImageSimilar(param);
            if(res.data.success){
                var data = res.data.data;
                if(item){
                    setRequestImage(item.image);
                    setCurrentUser(item.user)
                }
                setCurrentID(id)
                setImageSimilars([...[]]);
                setImageSimilars([...data]);
                setShowDetail(true);
            }
            else{
                toast.error("Something wrong! Please try again!")
            }

            setShowLoading(false);
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
        }
    }

    const handleRejectRequest = async () => {
        try{
            const api = new CopyrightAPI();
            var param = {
                id: currentID,
            }
            
            setShowLoading(true);
            var res = await api.rejectRequest(param);
            if(res.data.success){
                var temp = appealRequest;
                temp = temp.filter((e, ind) => {
                    return e.id != currentID;
                })
                setAppealRequest([...temp]);
                eventCallBack();
                toast.success("Reject request success!");
            }
            else{
                toast.error("Something wrong! Please try again!")
            }

            setShowLoading(false);
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
        }
        
    }

    const handleAcceptRequest = async () => {
        try{
            const api = new CopyrightAPI();
            var id = currentID,
                key = currentUser.substring(2);
            
            setShowLoading(true);
            var res = await api.acceptRequest(id, key);
            if(res.data.success){
                var temp = appealRequest;
                temp = temp.filter((e, ind) => {
                    return e.id != currentID;
                })
                setAppealRequest([...temp]);
                eventCallBack();
                setShowMessasgeBox(false)
                toast.success("Accept request success!");
            }
            else{
                toast.error("Something wrong! Please try again!")
            }

            setShowLoading(false);
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
        }
    }

    const child = (
        <div className={cx('detail-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('content', 'd-flex')}>
                <div className={cx('flex-1', 'd-flex', 'wrapper-content', 'align-center', 'justify-center', 'flex-column')} style={{marginRight: "15px"}}>
                    <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "15px"}}>Requested image</div>
                    <div className={cx('image-request')} style={{backgroundImage: requestImage}}></div>
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
            <div className={cx('footer', 'd-flex', 'w-full')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => eventCallBack()}>Cancel</Button>
                <Button normal onClick={() => handleRejectRequest()}>Reject</Button>
                <Button primary onClick={() => setShowMessasgeBox(true)}>Accept</Button>
            </div>
        </div>
    )
    
    const submitBtn = (
        <Button primary onClick={() => {handleAcceptRequest()}}>Accept</Button>
    )

    return ( 
        <div className={cx('request-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('content', 'd-flex', 'flex-1', 'flex-column')}>
                <div className={cx('header', 'd-flex', 'w-full', 'flex-column')}>
                    <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "18px"}}>Appeal Request</div>
                    <div className={cx('filter', 'd-flex', 'w-full')}>
                        <div className={cx('date-picker-wrapper', 'mr-8')}>
                            <p className={cx('title-date-picker', 'font-bold')}>Start date</p>
                            <DatePicker 
                                className={cx('date-picker')} 
                                dateFormat="dd/MM/yyyy" 
                                selected={startDate} 
                                onChange={(date) => setStartDate(date)} 
                            />
                        </div>

                        <div className={cx('date-picker-wrapper', 'mr-8')}>
                            <p className={cx('title-date-picker', 'font-bold')}>End date</p>
                            <DatePicker 
                                className={cx('date-picker')} 
                                dateFormat="dd/MM/yyyy" 
                                selected={endDate} 
                                onChange={(date) => setEndDate(date)} 
                            />
                        </div>
                        <Button primary className={cx('fit-content')} onClick={() => {filter()}}>Filter</Button>
                    </div>
                </div>

                <div className={cx('tb-wrapper', 'flex-1')}>
                    <table className={cx('table-header', 'w-full')}>
                        <tr>
                            <th className={cx('td-stt')}>STT</th>
                            <th className={cx('td-author')}>Author</th>
                            <th className={cx('td-date')}>Created date</th>
                            <th className={cx('td-function')}></th>
                        </tr>
                    </table>
                    <table className={cx('table-content', 'w-full')}>
                        <tbody>
                            {appealRequest.length > 0 ? (
                                appealRequest.map((e, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={cx('td-stt')}>{index + 1}</td>
                                            <td className={cx('td-author')}>{e.user}</td>
                                            <td className={cx('td-date')}>{e.createdDate}</td>
                                            <td className={cx('td-function')}>
                                                <div onClick={() => {handleViewRequest(e.id)}}>View</div>
                                            </td>
                                        </tr>
                                    )
                                    
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4}></td>
                                </tr>
                            )}
                        </tbody>
                        
                        
                    </table>
                </div>
            </div>
            <Navigation value={numberPerPage} totalRecord={totalRecord} onCallBack={changePage}/>
            {showDetail && <PopupDetail title={"Request detail"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={eventCallBack}/>}
            {showMessasgeBox && <MessageBox type={"warning"} title={title} message={message} scale={{height: "200px", width: "450px"}} child={submitBtn} eventCallBack={()=>{setShowMessasgeBox(false)}}/>}
            {showLoading && <Loading />}
            <ToastContainer/>
        </div>
    );
}

export default AppealRequest;