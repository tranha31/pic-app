import Button from '@/components/base/Button';
import styles from './Auction.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import AuctionDetail from './AuctionDetail';
import TradeAPI from '@/api/trade';
import Metamask from '@/api/metamask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/components/base/Loading';
import Tippy from '@tippyjs/react/headless';
import Select from 'react-select';

const cx = classNames.bind(styles);

function Auction() {

    var curDate = new Date();
    
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date(curDate.setDate(curDate.getDate() + 60)));

    const [listAuction, setListAuction] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const [curIndex, setCurIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null)

    const [showAuctionRoom, setShowAuctionRoom] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [paramOrder, setParamOrder] = useState(-1);
    const [statusOrder, setStatusOrder] = useState({value: -1, label: 'All'}) 
    const orderStatus = [
        { value: -1, label: 'All' },
        { value: 0, label: 'Not started yet' },
        { value: 1, label: 'Started' },
    ];

    useEffect(()=>{
        getInitData()
    }, [])

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
        try{
            return handleGetAuction(index);
        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
        
    }

    const handleGetAuction = async (index) => {
        try{
            setShowLoading(true);
            const api = new TradeAPI();
            var param = {
                start : index,
                length : 20,
                fromDate: new Date(startDate),
                toDate: new Date(endDate),
                status: paramOrder
            }
            
            var res = await api.getAuctionRoomHomePaging(param);
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
                "highestBetID" : e.infor.highestBetID,
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

    const handleChangeOrderrStatus = (v) => {
        setStatusOrder(v);
        setParamOrder(v.value);
    }

    return (
        <div className={cx('auction-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('auction-header', 'd-flex', 'w-full', 'flex-column')}>
                <div className={cx('title', 'd-flex', 'w-full')}>
                    <div className={cx('flex-1', 'font-bold', 'font-size-18')}>Auction room</div>
                    <Tippy
                        visible={showFilter}
                        interactive
                        placement="bottom"
                        offset={0}
                        render={attrs => (
                            <div className={cx('filter-box', 'd-flex', 'flex-column')} tabIndex="-1" {...attrs} style={{height: "200px"}}>
                                <div className={cx('filter-header', 'd-flex', 'mb-8')}>
                                    <div className={cx('icon-filter')}></div>
                                    <div className={cx('font-bold', 'font-size-18')}>Filter</div>
                                </div>
                                <div className={cx('filter-content', 'd-flex', 'flex-column', 'flex-1')}>
                                    <div>
                                        <div className={cx('font-bold', 'mb-8')}>Start status</div>
                                        <Select 
                                            options={orderStatus} 
                                            isSearchable={false}
                                            defaultValue={orderStatus[0]}
                                            value={statusOrder}
                                            menuPlacement='auto'
                                            onChange={(v) => handleChangeOrderrStatus(v)}
                                        />
                                    </div>
                                </div>

                                <div className={cx('d-flex', 'w-full')}>
                                    <div className={cx('flex-1')}></div>
                                    <Button normal onClick={() => {setShowFilter(false)}}>Close</Button>
                                    <Button primary onClick={() => {filterData()}}>OK</Button>
                                </div>
                            </div>
                        )}
                    >
                        <div className={cx('filter-btn')} onClick={() => {setShowFilter(true)}}></div>
                    </Tippy>
                </div>

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
                </div>
                
            </div>
            <div className={cx('auction-content', 'w-full', 'd-flex')}>
                {
                    listAuction.length > 0 ? 
                    (
                        listAuction.map((e, index) => {
                            return (
                                <div key={index} className={cx('content-auction','d-flex', 'flex-column', selectedItem?.id === e.id ? 'active' : '')}
                                    onClick={() => {setShowAuctionRoom(true)}}
                                    data-id={e.id}

                                >
                                    <div className={cx('image')} style={{backgroundImage: e.image}}></div>
                                    <div className={cx('info', 'd-flex', 'flex-column')} style={{overflow: 'auto'}}>
                                        <div className={cx('highest-price')}>Highest price: {e.highestPrice} ETH</div>
                                        <div className={cx('author')}>Author: 0x{e.user}</div>
                                        <div className={cx('')} style={{marginBottom: "10px"}}>Start price: {e.startPrice} ETH</div>
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

            {showAuctionRoom && <AuctionDetail eventCallBack={()=>{setShowAuctionRoom(false)}}/>}
            <ToastContainer/>
            {showLoading && <Loading/>}
        </div>
    );
}

export default Auction;