import styles from './ParticipatingRoom.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import Button from '@/components/base/Button';
import AuctionDetail from '@/components/layouts/Home/Auction/AuctionDetail';
import TradeAPI from '@/api/trade';
import Metamask from '@/api/metamask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/components/base/Loading';
import MessageBox from '@/components/base/MessageBox';
import Select from 'react-select';
import CopyrightAPI from '@/api/copyright';

const cx = classNames.bind(styles);

function ParticipatingRoom({isReload, updateReload, callBackEvent}) {

    const [showDetail, setShowDetail] = useState(false);

    const [paramRoomStatus, setParamRoomStatus] = useState(-1);

    const [statusReq, setStatusReq] = useState({value: -1, label: 'All'}) 
    const roomStatus = [
        {value: -1, label: 'All'},
        { value: 0, label: 'Not started yet' },
        { value: 1, label: 'Going on' },
        { value: 2, label: 'Finished' },
    ];

    const [oDataDetail, setODataDetail] = useState(null)

    const [listAuction, setListAuction] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const [curIndex, setCurIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);

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
            var param = {
                key: address,
                start : index,
                length : 20,
                status: paramRoomStatus,
            }
            
            var res = await api.getAuctionRoomJoinPaging(param);
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

    const handleChangeRoomStatus = (v) => {
        setStatusReq(v);
        setParamRoomStatus(v.value);
    }

    const callBackDetail = (state) => {
        setShowDetail(false);
        setODataDetail(null);
        filterData();
    }

    const handleShowAuctionRoom = () => {
        var room = listAuction.filter((e, i) => {
            return e.id === selectedItem.id;
        })

        var data = room[0]
        data.startTime = data.startTime.substring(3, 5) + "/" + data.startTime.substring(0, 2) + "/" + data.startTime.substring(6)
        data.endTime = data.endTime.substring(3, 5) + "/" + data.endTime.substring(0, 2) + "/" + data.endTime.substring(6)
        setODataDetail(data);
        setShowDetail(true);
    }

    const handleWithDraw = async () => {
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

            if(address.substring(2) === selectedItem.highestBeter){
                toast.warning("You are the highest bidder. You cannot withdraw.");
                return;
            }

            setShowLoading(true);
            await metamask.connectSmartContract();
            var now = new Date();
            now = now.getTime();
            await metamask.withDraw(selectedItem.id, now, address);

            var api = new TradeAPI();
            var res = await api.addNewHistory(selectedItem.id, address.substring(2), 0, 1);
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

    const handleEndAuction = async () => {
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
            callBackEvent();
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
                    <div className={cx('date-picker-wrapper', 'mr-8')} style={{width: "250px"}}>
                        <div className={cx('font-bold', 'mb-8')}>Image status</div>
                        <Select 
                            options={roomStatus} 
                            isSearchable={false}
                            defaultValue={roomStatus[0]}
                            value={statusReq}
                            menuPlacement='auto'
                            onChange={(v) => handleChangeRoomStatus(v)}
                        />
                    </div>
                    <Button primary className={cx('fit-content')} onClick={()=>filterData()}>Filter</Button>
                    <div className={cx('flex-1')}></div>
                    <Button normal disabled={selectedItem ? '' : 'disabled'} onClick={() => handleWithDraw()}>Withdraw</Button>
                    <Button normal disabled={selectedItem ? '' : 'disabled'} onClick={() => {handleShowAuctionRoom()}}>Edit</Button>
                    <Button normal disabled={selectedItem ? '' : 'disabled'} onClick={() => {handleEndAuction()}}>End auction</Button>
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
                <Button className={cx('see-more-btn')} primary onClick={() => loadMoreData()}>See more</Button>
            </div>

            {showDetail && <AuctionDetail oData={oDataDetail} eventCallBack={callBackDetail}/>}
            <ToastContainer/>
            {showLoading && <Loading/>}
        </div>
    );
}

export default ParticipatingRoom;