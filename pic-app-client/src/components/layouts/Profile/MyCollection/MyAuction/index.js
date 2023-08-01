import Button from '@/components/base/Button';
import styles from './MyAuction.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import AddNewAutionDetail from './AddNewAuctionDetail';
import TradeAPI from '@/api/trade';
import Metamask from '@/api/metamask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/components/base/Loading';
import MessageBox from '@/components/base/MessageBox';
import AuctionDetail from '@/components/layouts/Home/Auction/AuctionDetail';
import CopyrightAPI from '@/api/copyright';

const cx = classNames.bind(styles);

function MyAuction({isReload, updateReload, callBackEvent}) {

    var curDate = new Date();
    
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date(curDate.setDate(curDate.getDate() + 60)));

    const [showDetail, setShowDetail] = useState(false);

    const [listAuction, setListAuction] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const [curIndex, setCurIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null)

    const [showMessage, setShowMessage] = useState(false)
    const [typeMessage, setTypeMessage] = useState("warning")
    const [titleMessage, setTitleMessage] = useState("")
    const [contetnMessage, setContetnMessage] = useState("")
    const [btnMessage, setBtnMessage] = useState(
        <Button primary>Submit</Button>
    )

    const [oDataDetail, setODataDetail] = useState(null)

    const [showAuctionDetail, setShowAuctionDetail] = useState(false)
    const [oDataInforRoom, setODataInforRoom] = useState(null)

    useEffect(()=>{
        getInitData()
    }, [])

    useEffect(() => {
        if(isReload){
            filterData()
            updateReload();
        }
    }, [isReload])

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setListAuction([...data])
        }
    }

    const filterData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setListAuction([...data])
            setSelectedItem(null)
        }
    }

    const loadMoreData = async () => {
        var index = curIndex + 20;
        setCurIndex(index);
        var curData = listAuction;
        var data = await handlePagingData(index);
        if(data !== false){
            var merData = [...curData, ...data]
            setListAuction([...merData])
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
            return handleGetAuction(index, address);

        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
        
    }

    const handleGetAuction = async (index, address) => {
        try{
            setShowLoading(true);
            const api = new TradeAPI();
            var fromDate = new Date(startDate)
            var toDate = new Date(endDate)
            var param = {
                key: address,
                start : index,
                length : 20,
                fromDate: fromDate.toLocaleDateString() + " 00:00:00",
                toDate: toDate.toLocaleDateString() + " 23:59:59",
            }
            
            var res = await api.getAuctionRoomPaging(param);
            if(res.data.success){
                var data = res.data.data;
                var auctionRooms = [];
                if(data){
                    auctionRooms = convertDataAuction(data);
                    
                }
                setShowLoading(false);
                return auctionRooms;
            }
            else{
                setShowLoading(false);
                toast.error("Something wrong! Please try again!")
                return false;
            }
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
            return false;
        }
    }
    
    const convertDataAuction = (data) => {
        var auction = data.map((e, i) => {
            var contentImage = "url('" + e.image + "')";
            var startTime = new Date(e.infor.startTime).toLocaleString('en-GB', {
                hour12: false,
            });
            var endTime = new Date(e.infor.endTime).toLocaleString('en-GB', {
                hour12: false,
            });
            return {
                "id": e.infor.id,                
                "imageID" : e.infor.imageID,
                "highestBeter" : e.infor.highestBeter,
                "highestPrice" : e.infor.highestPrice,
                "user" : e.infor.ownerPublicKey,
                "startTime": startTime.substring(0, 10) + startTime.substring(11),
                "endTime": endTime.substring(0, 10) + endTime.substring(11),
                "image" : contentImage,
                "startPrice": e.infor.startPrice,
                "status": e.infor.status,
                "startTimeCheck": e.infor.startTime
            }
        });

        return auction;
    }

    const handleChooseAuctionRoom = (id) => {
        if(!selectedItem){
            var item = listAuction.filter((e, i) => {
                return e.id === id
            })
    
            setSelectedItem(item[0])
        }
        else if(selectedItem.id === id){
            setSelectedItem(null)
        }
        else{
            var item = listAuction.filter((e, i) => {
                return e.id === id
            })
    
            setSelectedItem(item[0])
        }
        
    }

    const handleDeleteAuctionRoom = async () => {
        var now = new Date()
        if(now >= new Date(selectedItem.startTimeCheck)){
            setTypeMessage("error")
            setTitleMessage("Can't delete")
            setContetnMessage("Auction has begun. You can't delete auction!")
            setBtnMessage(null)
            setShowMessage(true)

            return;
        }

        try{
            var api = new TradeAPI()
            var param = {
                id: selectedItem.id
            }

            var res = await api.deleteAuctionRoom(param)
            if(res.data.success){
                var temp = listAuction;
                temp = temp.filter((e, ind) => {
                    return e.id != selectedItem.id;
                })
                setListAuction([...temp]);
                setShowLoading(false);
                setSelectedItem(null)
                toast.success("Delete success!")
                callBackEvent();
            }
            else{
                setShowLoading(false);
                toast.error("Something wrong! Please try again!")
            }
        }
        catch(err){
            setShowLoading(false);
            toast.error("Something wrong! Please try again!")
        }
    }

    const handleAddNew = () =>{
        var now = new Date()
        var start = new Date(now.setDate(now.getDate() + 2))
        var end = new Date(now.setDate(now.getDate() + 5))
        var data = {
            editMode: 0,
            id: null,
            startDate: start,
            endDate: end,
            startPrice: 0,
            currentImage: null
        }

        setODataDetail(data)
        setShowDetail(true)
    }

    const handleEdit = () => {
        var now = new Date()
        if(now >= new Date(selectedItem.startTimeCheck)){
            setTypeMessage("error")
            setTitleMessage("Can't edit")
            setContetnMessage("Auction has begun. You can't edit auction!")
            setBtnMessage(null)
            setShowMessage(true)

            return;
        }

        var dataTemp = JSON.stringify(selectedItem)
        dataTemp = JSON.parse(dataTemp)

        var start = dataTemp.startTime;
        var startTimeString = start.substring(3, 5) + "/" + start.substring(0, 2) + "/" + start.substring(6)
        var end = dataTemp.endTime;
        var endTimeString = end.substring(3, 5) + "/" + end.substring(0, 2) + "/" + end.substring(6)

        var data = {
            editMode: 1,
            id: selectedItem.id,
            startDate: new Date(startTimeString),
            endDate: new Date(endTimeString),
            startPrice: selectedItem.startPrice,
            currentImage: {
                imageID: selectedItem.imageID,
                image: selectedItem.image
            }
        }
        setODataDetail(data)
        setShowDetail(true)
    }

    const handleCallBackDetail = (status) => {
        if(status === 0){
            setShowDetail(false)
        }
        else if(status === 1){
            setShowDetail(false)
            filterData()
            callBackEvent()
        }
    }

    const handleCallBackViewAuctionRoom = () =>{
        setODataInforRoom(null)
        setShowAuctionDetail(false)
    }

    const handleViewAuctionRoom = () => {
        var data = JSON.stringify(selectedItem)
        data = JSON.parse(data)
        data.startTime = data.startTime.substring(3, 5) + "/" + data.startTime.substring(0, 2) + "/" + data.startTime.substring(6)
        data.endTime = data.endTime.substring(3, 5) + "/" + data.endTime.substring(0, 2) + "/" + data.endTime.substring(6)
        setODataInforRoom(data)
        setShowAuctionDetail(true)
    }

    const handleFinishAuction = async () => {
        var now1 = new Date();
        var endDate = selectedItem.endTime.substring(3, 5) + "/" + selectedItem.endTime.substring(0, 2) + "/" + selectedItem.endTime.substring(6);
        if(now1 < new Date(endDate)){
            toast.warning("Auction is not finished");
            return;
        }

        try{
            const metamask = new Metamask();
            var check = await metamask.checkConnect();
            if(!check){
                toast.warning("Install metamask extension!");
                return;
            }
            
            var checkNetwork = await metamask.checkAcceptNetwork();
            if(!checkNetwork){
                toast.warning("Your current network is not supported.");
                return;
            }

            var address = await metamask.getAddress();
            address = address[0];

            setShowLoading(true);
            await metamask.connectSmartContract();
            var now = new Date();
            now = now.getTime();
            await metamask.endAuction(selectedItem.id, now, address);

            var api = new CopyrightAPI();
            var res = await api.updateCopyrightForAuction(selectedItem.id);
            if(!res.data.success){
                toast.warning("Something wrong! Please try again.");
            }

            setShowLoading(false);
            filterData();
        }
        catch(err){
            toast.error("Transaction fail! Please try again!");
            setShowLoading(false);
        }
    }

    return ( 
        <div className={cx('auction-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('auction-header', 'd-flex', 'w-full', 'flex-column')}>
                <div className={cx('filter', 'd-flex', 'w-full')}>
                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker', 'font-bold')}>Start time</p>
                        <DatePicker 
                            className={cx('date-picker')} 
                            dateFormat="dd/MM/yyyy HH:mm" 
                            selected={startDate} 
                            showTimeInput
                            timeInputLabel="Time:"
                            showYearDropdown
                            yearDropdownItemNumber={15}
                            scrollableYearDropdown
                            onChange={(date) => setStartDate(date)} 
                            onBlur={() => {if(!startDate){setStartDate(new Date())}}}
                        />
                    </div>

                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker', 'font-bold')}>End time</p>
                        <DatePicker 
                            className={cx('date-picker')} 
                            dateFormat="dd/MM/yyyy HH:mm" 
                            selected={endDate} 
                            showTimeInput
                            timeInputLabel="Time:"
                            showYearDropdown
                            yearDropdownItemNumber={15}
                            scrollableYearDropdown
                            onChange={(date) => setEndDate(date)} 
                            onBlur={() => {if(!endDate){setEndDate(new Date())}}}
                        />
                    </div>
                    <Button primary className={cx('fit-content')} onClick={() => {filterData()}}>Filter</Button>
                    <div className={cx('flex-1')}></div>
                    {selectedItem && <Button normal onClick={() => handleFinishAuction()}>End</Button>}
                    {selectedItem && <Button normal onClick={() => {handleDeleteAuctionRoom()}}>Delete</Button>}
                    {selectedItem && <Button normal onClick={() => {handleViewAuctionRoom()}}>View</Button>}
                    {selectedItem && <Button normal onClick={() => handleEdit()}>Edit</Button>}
                    <Button primary onClick={() => {handleAddNew()}}>Add new</Button>
                </div>
                
            </div>
            <div className={cx('auction-content', 'w-full', 'd-flex')}>
                {
                    listAuction.length > 0 ? 
                    (
                        listAuction.map((e, index) => {
                            return (
                                <div key={index} className={cx('content-auction','d-flex', 'flex-column', selectedItem?.id === e.id ? 'active' : '')}
                                    onClick={() => {handleChooseAuctionRoom(e.id)}}
                                    data-id={e.id}

                                >
                                    <div className={cx('image')} style={{backgroundImage: e.image}}></div>
                                    <div className={cx('info', 'd-flex', 'flex-column')} style={{overflow: 'auto'}}>
                                        <div className={cx('highest-price')}>Highest price: {e.highestPrice} ETH</div>
                                        <div className={cx('')}>Start price: {e.startPrice} ETH</div>
                                        <div className={cx('')}>Start time: {e.startTime}</div>
                                        <div className={cx('')}>End time: {e.endTime}</div>
                                    </div>
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

            <div className={cx('see-more', 'd-flex', 'flex-1', 'justify-center')}>
                <Button className={cx('see-more-btn')} primary onClick={() => {loadMoreData()}}>See more</Button>
            </div>

            {showDetail && <AddNewAutionDetail callBackEvent={(state) => {handleCallBackDetail(state)}} oData={oDataDetail}/>}
            {showAuctionDetail && <AuctionDetail oData={oDataInforRoom} eventCallBack={()=>handleCallBackViewAuctionRoom()}/>}
            {showMessage && <MessageBox type={typeMessage} title={titleMessage} message={contetnMessage} child={btnMessage} scale={{height: "200px", width: "450px"}} eventCallBack={() => {setShowMessage(false)}}/>} 
            {showLoading && <Loading/>}
        </div>
    );
}

export default MyAuction;