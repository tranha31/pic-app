import Button from '@/components/base/Button';
import styles from './MyCollection.module.scss';
import classNames from 'classnames/bind';
import { Fragment, useEffect, useState } from 'react';
import MyAuction from './MyAuction';
import ParticipatingRoom from './ParticipantingRoom';
import Tippy from '@tippyjs/react/headless';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import Metamask from '@/api/metamask';
import CollectionAPI from '@/api/collection';
import Loading from '@/components/base/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import saling from "../../../../assets/imgs/saling.png";
import auctioning from "../../../../assets/imgs/auctioning.png";
import PopupDetail from '@/components/base/PopupDetail';
import Sell from './Sell';
import TradeAPI from '@/api/trade';
import MessageBox from '@/components/base/MessageBox';
import AddNewAutionDetail from './MyAuction/AddNewAuctionDetail';


const cx = classNames.bind(styles);

function MyCollection({callBackUpdate, searchKey, isSearchData}) {

    const [tab, setTab] = useState(0);
    const [showDetail, setShowDetail] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    var curDate = new Date();
    
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [paramImageStatus, setParamImageStatus] = useState(-1);

    const [statusReq, setStatusReq] = useState({value: -1, label: 'All'}) 
    const imageStatus = [
        {value: -1, label: 'All'},
        { value: 0, label: 'Free' },
        { value: 1, label: 'Images for sale' },
        { value: 2, label: 'Auction images' },
    ];

    const [showLoading, setShowLoading] = useState(false);

    const [listImage, setListImage] = useState([]);
    const [selectedItem, setSelectedItem] = useState([]);
    const [curIndex, setCurIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState("");

    const [showSellDetail, setShowSellDetail] = useState(false);

    const [showFilterSell, setShowFilterSell] = useState(false);
    const [startDateSell, setStartDateSell] = useState(new Date(curDate));
    const [endDateSell, setEndDateSell] = useState(new Date());
    const [listSell, setListSell] = useState([]);
    const [sellSelectedItem, setSellSelectedItem] = useState([]);
    const [curIndexSell, setCurIndexSell] = useState(0);
    const [currentImageSell, setCurrentImageSell] = useState("");
    const [showViewItemSell, setShowViewItemSell] = useState(false);
    const [currentItemSellShow, setCurrentItemSellShow] = useState();
    const [showMessage, setShowMessage] = useState(false)
    const [searchValue, setSearchValue] = useState(searchKey)

    const [titleMessage, setTitleMessage] = useState("")
    const [contetnMessage, setContetnMessage] = useState("")

    const [dataSell, setDataSell] = useState()

    const [reloadAuction, setReloadAuction] = useState(false)

    const [showAuctionDetail, setShowAuctionDetail] = useState(false);
    const [oDataAuctionDetail, setODataAuctionDetail] = useState(null);

    useEffect(()=>{
        setSearchValue(searchKey)
    }, [searchKey])

    useEffect(() => {
        getInitData();
        callBackUpdate(true, searchValue)
    }, []);

    useEffect(() => {
        if(tab === 0 && listImage.length === 0){
            handleRefresh();
            callBackUpdate(true, searchValue)
        }
        else if(tab === 1 && listSell.length === 0){
            handleRefresh();
            callBackUpdate(false, searchValue)
        }
        else{
            if(tab === 1){
                callBackUpdate(false, searchValue)
            }
            else{
                callBackUpdate(true, searchValue)
            }
            
        }

        setShowFilter(false);
        setShowFilterSell(false);
    }, [tab])

    useEffect(() => {
        if(isSearchData && tab === 1){
            handleRefresh();
        }
    }, [isSearchData])

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setListImage([...data])
            }
            else if(tab === 1){
                //setAppealRequests([...data])
            }
        }
        
    }

    const goToTab = (index) => {
        setTab(index);
    }

    const handleChangeImageStatus = (v) => {
        setStatusReq(v);
        setParamImageStatus(v.value);
    }

    const handleRefresh = async () => {
        if(tab === 0 || tab === 1){
            var data = await handlePagingData(0);
            if(data !== false){
                if(tab === 0){
                    setCurrentImage("")
                    setSelectedItem([...[]])
                    setListImage([...data])
                    setCurIndex(0)
                    setShowFilter(false)
                }
                else if(tab === 1){
                    setCurrentImageSell("")
                    setSellSelectedItem([...[]])
                    setListSell([...data])
                    setCurIndexSell(0)
                    setShowFilterSell(false)
                }
            }
        }
        else if(tab === 2){
            setReloadAuction(true)
        }
    }

    const refreshFilter = () => {
        var curDate = new Date();
        setStartDate(new Date(curDate.setDate(curDate.getDate() - 30)))
        setEndDate(new Date())

        setStatusReq(imageStatus[0]);
        setParamImageStatus(-1);
    }

    const refreshFilterSell = () => {
        var curDate = new Date();
        setStartDateSell(new Date(curDate.setDate(curDate.getDate() - 30)))
        setEndDateSell(new Date())
    }

    const filterData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setCurrentImage("")
                setSelectedItem([...[]])
                setCurIndex(0);
                setListImage([...[]]);
                setListImage([...data])
                setShowFilter(false);
            }
            else if (tab === 1){
                setCurrentImageSell("")
                setSellSelectedItem([...[]])
                setCurIndexSell(0);
                setListSell([...[]])
                setListSell([...data])
                setShowFilterSell(false)
            }
        }
    }

    const loadMoreData = async () => {
        if(tab === 0){
            var index = curIndex + 20;
            setCurIndex(index);
            var curData = listImage;
            var data = await handlePagingData(index);
            if(data !== false){
                var merData = [...curData, ...data]
                setListImage([...merData])
            }
        }
        else{
            var index = curIndexSell + 20;
            setCurIndexSell(index);
            var curData = listSell;
            var data = await handlePagingData(index);
            if(data !== false){
                var merData = [...curData, ...data]
                setListSell([...merData])
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
                return handleGetImage(index, address);
            }
            else if (tab === 1){
                return handleGetSell(index, address);
            }

        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
        
    }

    const handleGetSell = async (index, address) => {
        try{
            setShowLoading(true);
            const api = new TradeAPI();
            var fromDate = new Date(startDateSell)
            var toDate = new Date(endDateSell)
            var param = {
                key: address,
                searchKey: searchValue,
                start : index,
                length : 20,
                fromDate: new Date(fromDate.setHours(0,0,0,0)),
                toDate: new Date(toDate.setHours(23,59,59,1000)),
            }
            
            var res = await api.getSellPaging(param);
            if(res.data.success){
                var data = res.data.data;
                var sellItem = [];
                if(data){
                    sellItem = convertDataSell(data);
                    
                }
                setShowLoading(false);
                return sellItem;
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

    const handleGetImage = async (index, address) => {
        try{
            setShowLoading(true);
            const api = new CollectionAPI();
            var fromDate = new Date(startDate)
            var toDate = new Date(endDate)
            var param = {
                key: address,
                start : index,
                length : 20,
                status : paramImageStatus,
                fromDate: new Date(fromDate.setHours(0,0,0,0)),
                toDate: new Date(toDate.setHours(23,59,59,1000)),
            }
            
            var res = await api.getImagePaging(param);
            if(res.data.success){
                var data = res.data.data;
                var image = [];
                if(data){
                    image = convertDataImage(data);
                    
                }
                setShowLoading(false);
                return image;
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

    const convertDataImage = (data) => {
        var image = data.map((e, i) => {
            var contentImage = "url('" + e.image + "')"; 
            return {
                "id": e.infor.imageID,
                "status" : e.infor.status,
                "image" : contentImage,
            }
        })

        return image;
    }

    const convertDataSell = (data) => {
        var sell = data.map((e, i) => {
            var contentImage = "url('" + e.image + "')";
            return {
                "id": e.infor.id,                
                "caption" : e.infor.caption,
                "detail" : e.infor.detail,
                "price" : e.infor.price,
                "user" : e.infor.userPublicKey,
                "modifiedDate": new Date(e.infor.modifiedDate).toLocaleString('en-GB', {
                    hour12: false,
                  }).substring(0, 10),
                "image" : contentImage,
                "imageID": e.infor.imageID
            }
        });

        return sell;
    }

    const handleChooseImage = (id) => {
        if (selectedItem.length == 0){
            setSelectedItem([...[]])
            setSelectedItem([id])
        }
        else if(selectedItem[0] === id){
            setSelectedItem([...[]])
        }
        else{
            setSelectedItem([...[]])
            setSelectedItem([id])
        }
    }

    const handleDownloadData = () => {
        try{
            const api = new CollectionAPI();
            api.downloadImage(selectedItem[0])

        }
        catch(err){

        }
    }

    const handleShowImage = (id) => {
        var image = listImage.find((e, i) => {
            return e.id === id;
        })

        setCurrentImage(image.image)
        setShowDetail(true)
    }

    const handleChooseItemSell = (id) => {
        if (sellSelectedItem.length == 0){
            setSellSelectedItem([...[]])
            setSellSelectedItem([id])
        }
        else if(sellSelectedItem[0] === id){
            setSellSelectedItem([...[]])
        }
        else{
            setSellSelectedItem([...[]])
            setSellSelectedItem([id])
        }
    }

    const handleShowItemSell = (id) => {
        var sell = listSell.find((e, i) => {
            return e.id === id;
        })

        setCurrentItemSellShow(sell)
        setShowViewItemSell(true)
    }

    const handleGoToSell = () => {
        var image = listImage.find((e, i) => {
            return e.id === selectedItem[0];
        })
        if(image.status !== 0){
            toast.warning("Image can't sell!")
            return;
        }
        setCurrentImage(image.image)
        setDataSell({
            editMode: 0,
            id: "",
            imageID: image.id,
            caption: "",
            detail: "",
            price: "",
            imageContent: image.image
        })
        setShowSellDetail(true);
    }

    const handleGoToCreateAuction = () => {
        var image = listImage.find((e, i) => {
            return e.id === selectedItem[0];
        })
        if(image.status !== 0){
            toast.warning("Image can't create auction!")
            return;
        }

        var now = new Date()
        var start = new Date(now.setDate(now.getDate() + 2))
        var end = new Date(now.setDate(now.getDate() + 5))
        var data = {
            editMode: 0,
            id: null,
            startDate: start,
            endDate: end,
            startPrice: 0,
            currentImage: {
                imageID: image.id,
                image: image.image
            }
        }

        setODataAuctionDetail(data)
        setShowAuctionDetail(true)
    }

    const handleCallBackDetail = (status) => {
        if(status === 0){
            setShowAuctionDetail(false)
        }
        else if(status === 1){
            setShowAuctionDetail(false)
            filterData()
        }
    }

    const handleCallBackSellDetail = (data) => {
        setShowSellDetail(false);
        if(tab === 0){
            var lstImage = listImage;
            lstImage = lstImage.map((e, i) => {
                if(e.id == selectedItem[0]){
                    e.status = 1;
                }
    
                return e;
            })
            
            setListImage([...[]])
            setListImage([...listImage])
            setSelectedItem([...[]])
            setCurrentImage("");
        }
        else if(tab === 1){
            var temp = listSell;
            temp = temp.map((e, ind) => {
                if(e.id == data.id){
                    e.caption = data.caption;
                    e.detail = data.detail;
                    e.price = data.price;
                    e.modifiedDate = new Date().toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10);
                }
                return e;
            })
            setListSell([...temp]);
        }

    }

    const handleDelelteItem = () => {
        setTitleMessage("Warning")
        setContetnMessage("Are you sure you want to delete?")
        setBtnMessage(<Button primary onClick={() => {deleteItemSell(sellSelectedItem[0])}}>Submit</Button>)
        setShowMessage(true)
    }

    const handleDelelteItemInForm = () => {
        setTitleMessage("Warning")
        setContetnMessage("Are you sure you want to delete?")
        setBtnMessage(<Button primary onClick={() => {deleteItemSell(currentItemSellShow.id)}}>Submit</Button>)
        setShowMessage(true)
    }

    const deleteItemSell = async (id) => {
        setShowMessage(false)
        setShowViewItemSell(false)
        try{
            setShowLoading(true);
            var api = new TradeAPI()
            var param = {
                id: id
            }
            var res = await api.deleteItemSell(param);
            if(res.data.success){
                var temp = listSell;
                temp = temp.filter((e, ind) => {
                    return e.id != id;
                })
                setListSell([...temp]);
                setShowLoading(false);
                toast.success("Delete success!")
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

    const handleEditItem = () => {
        var temp = listSell;
        temp = temp.filter((e, ind) => {
            return e.id == sellSelectedItem[0];
        })
        setDataSell({
            editMode: 1,
            id: temp[0].id,
            imageID: temp[0].imageID,
            caption: temp[0].caption,
            detail: temp[0].detail,
            price: temp[0].price,
            imageContent: temp[0].image
        })
        setShowSellDetail(true);
    }

    const handleEditItemInForm = () => {
        setShowViewItemSell(false)
        setDataSell({
            editMode: 1,
            id: currentItemSellShow.id,
            imageID: currentItemSellShow.imageID,
            caption: currentItemSellShow.caption,
            detail: currentItemSellShow.detail,
            price: currentItemSellShow.price,
            imageContent: currentItemSellShow.image
        })
        setShowSellDetail(true);
    }

    const reloadListImage = async () => {
        var metamask = new Metamask()
        var address = await metamask.getAddress();
        address = address[0];
        address = address.substring(2);

        var data = handleGetImage(0, address);
        if(data !== false){
            setListImage([...[]])
            setListImage([...data])
        }
    }

    const viewImage = (
        <div className={cx('d-flex', 'flex-column', 'w-full')}>
            <div className={cx('image-show')} style={{backgroundImage: currentImage, border: "1px solid #fff200"}}></div>
            <div className={cx('flex-1')}></div>
            <div className={cx('d-flex', 'w-full')} style={{padding: "10px 0"}}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => setShowDetail(false)}>Close</Button>
            </div>
        </div>

    )

    const viewItemSell = (
        <div className={cx('d-flex', 'flex-column', 'w-full')} style={{paddingBottom: "15px"}}>
            <div className={cx('d-flex', 'w-full', 'flex-1')} style={{paddingBottom: "10px"}}>
                <div className={cx('image-show', 'mr-16')} style={{backgroundImage: currentItemSellShow?.image, border: "1px solid #fff200"}}></div>
                <div className={cx('d-flex', 'flex-column', 'w-full')}>
                    <div className={cx('font-size-18', 'font-bold')} style={{color: "#0e1d38", paddingBottom: "10px"}}>{currentItemSellShow?.caption}</div>
                    <div style={{paddingBottom: "10px"}}>{currentItemSellShow?.modifiedDate}</div>
                    <div>Price: {currentItemSellShow?.price} ETH</div>
                    <div style={{paddingBottom: "10px"}}>Author: 0x{currentItemSellShow?.user}</div>
                    <div>{currentItemSellShow?.detail}</div>
                </div>
            </div>
            <div className={cx('d-flex', 'w-full')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => {setShowViewItemSell(false)}}>Close</Button>
                <Button normal onClick={() => {handleDelelteItemInForm()}}>Delete</Button>
                <Button primary onClick={() => {handleEditItemInForm()}}>Edit</Button>
            </div>
        </div>
        
    )

    const [btnMessage, setBtnMessage] = useState(
        <Button primary>Submit</Button>
    )

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Collection</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Images for sale</div>
                <div className={cx('tab-item', tab == 2 ? 'active' : "")} onClick={() => {goToTab(2)}}>My Auction room</div>
                <div className={cx('tab-item', tab == 3 ? 'active' : "")} onClick={() => {goToTab(3)}}>Participating Auction room</div>
                <div className={cx('flex-1')}></div>
                {tab === 0 && (
                    <div className={cx('d-flex', 'align-center', 'mr-8')}>From: {new Date(startDate).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)} - To: {new Date(endDate).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)}</div>
                )}
                {tab === 1 && (
                    <div className={cx('d-flex', 'align-center', 'mr-8')}>From: {new Date(startDateSell).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)} - To: {new Date(endDateSell).toLocaleString('en-GB', {
                        hour12: false,
                      }).substring(0, 10)}</div>
                )}
                <div className={cx('refresh')} onClick={() => {handleRefresh()}}></div>
                {tab == 0 && (
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
                                                onChange={(date) => setEndDate(date)} 
                                                onBlur={() => {if(!endDate){setEndDate(new Date())}}} 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className={cx('font-bold', 'mb-8')}>Image status</div>
                                        <Select 
                                            options={imageStatus} 
                                            isSearchable={false}
                                            defaultValue={imageStatus[0]}
                                            value={statusReq}
                                            menuPlacement='auto'
                                            onChange={(v) => handleChangeImageStatus(v)}
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
                )}
                
                {tab == 1 && (
                    <Tippy
                        visible={showFilterSell}
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
                                    <div className={cx('d-flex', 'w-full', 'mb-8')}>
                                        <div className={cx('date-picker-wrapper', 'mr-8', 'w-half')}>
                                            <p className={cx('title-date-picker', 'font-bold')}>From date</p>
                                            <DatePicker 
                                                className={cx('date-picker', 'w-full')} 
                                                dateFormat="dd/MM/yyyy" 
                                                selected={startDateSell} 
                                                onChange={(date) => setStartDateSell(date)} 
                                                onBlur={() => {if(!startDateSell){setStartDateSell(new Date())}}} 
                                            />
                                        </div>

                                        <div className={cx('date-picker-wrapper', 'w-half')}>
                                            <p className={cx('title-date-picker', 'font-bold')}>To date</p>
                                            <DatePicker 
                                                className={cx('date-picker', 'w-full')} 
                                                dateFormat="dd/MM/yyyy" 
                                                selected={endDateSell} 
                                                onChange={(date) => setEndDateSell(date)} 
                                                onBlur={() => {if(!endDateSell){setEndDateSell(new Date())}}} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('d-flex', 'w-full')}>
                                    <div className={cx('flex-1')}></div>
                                    <Button normal onClick={() => {setShowFilterSell(false)}}>Close</Button>
                                    <Button normal onClick={() => {refreshFilterSell()}}>Refresh</Button>
                                    <Button primary onClick={() => {filterData()}}>OK</Button>
                                </div>
                            </div>
                        )}
                    >
                        <div className={cx('filter')} onClick={() => {setShowFilterSell(true)}}></div>
                    </Tippy>
                )}
            </div>

            <div className={cx('collection-content', 'd-flex', 'flex-column', 'flex-1')}>
                { tab == 0 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                {
                                    listImage.length > 0 ? 
                                    (
                                        listImage.map((e, index) => {
                                            return (
                                                <div key={index} className={cx('content-image', selectedItem.indexOf(e.id) > -1 ? 'active' : '')} style={{backgroundImage: e.image}}
                                                    onClick={() => {handleChooseImage(e.id)}}
                                                    onDoubleClick={() => {handleShowImage(e.id)}}
                                                    data-id={e.id}

                                                >
                                                    {e.status === 1 && <img src={saling} className={cx('processing')} title="On sale" alt="loading..." />}
                                                    {e.status === 2 && <img src={auctioning} className={cx('processing')} title="On auction" alt="loading..." />}
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
                            <Button normal onClick={() => {loadMoreData()}}>See more</Button>
                            <Button normal disabled={selectedItem.length > 0 ? false : true} onClick={() => {handleDownloadData()}}>Download</Button>
                            <Button primary disabled={selectedItem.length > 0 ? false : true} onClick={() => {handleGoToSell()}}>Sell</Button>
                            <Button primary disabled={selectedItem.length > 0 ? false : true} onClick={() => {handleGoToCreateAuction()}}>Create auction</Button>
                        </div>
                        {showAuctionDetail && <AddNewAutionDetail callBackEvent={(state) => {handleCallBackDetail(state)}} oData={oDataAuctionDetail}/>}
                    </Fragment>
                    
                )}

                { tab == 1 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex')}>
                            {
                                listSell.length > 0 ? 
                                (
                                    listSell.map((e, index) => {
                                        return (
                                            <div key={index} className={cx('content-picture','d-flex', 'flex-column', sellSelectedItem.indexOf(e.id) > -1 ? 'active' : '')}
                                                onClick={() => {handleChooseItemSell(e.id)}}
                                                onDoubleClick={() => {handleShowItemSell(e.id)}}
                                                data-id={e.id}

                                            >
                                                <div className={cx('image')} style={{backgroundImage: e.image}}></div>
                                                <div className={cx('info', 'd-flex', 'flex-column')} style={{overflow: 'auto'}}>
                                                    <div className={cx('name')}>{e.caption}</div>
                                                    <div className={cx('price')}>Price: {e.price} ETH</div>
                                                    <div className={cx('author')}>{e.modifiedDate}</div>
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

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full', 'align-center')}>
                            <div className={cx('flex-1', 'font-bold', 'underline', 'font-italic', 'pl-10')}>Click duplex on item to see detail</div>
                            <Button normal onClick={() => loadMoreData()}>See more</Button>
                            <Button normal disabled={sellSelectedItem.length > 0 ? false : true} onClick={() => handleDelelteItem()}>Delete</Button>
                            <Button primary disabled={sellSelectedItem.length > 0 ? false : true} onClick={() => handleEditItem()}>Edit</Button>
                        </div>
                        {showViewItemSell && <PopupDetail title={"Item detail"} scale={{height: "85%", width: "65%"}} child={viewItemSell} eventCallBack={() =>setShowViewItemSell(false)}/>} 
                    </Fragment>
                )}

                { tab == 2 && (
                    <MyAuction isReload={reloadAuction} updateReload={() => setReloadAuction(false)} callBackEvent={() => {reloadListImage()}}/>
                )}

                {tab == 3 && (
                    <ParticipatingRoom />
                )}
                
            </div> 
            {showDetail && <PopupDetail title={"Image"} scale={{height: "85%", width: "65%"}} child={viewImage} eventCallBack={() =>setShowDetail(false)}/>}
            {showMessage && <MessageBox type={"warning"} title={titleMessage} message={contetnMessage} child={btnMessage} scale={{height: "200px", width: "450px"}} eventCallBack={() => {setShowMessage(false)}}/>} 
            {showSellDetail && <Sell eventCallBackSell={handleCallBackSellDetail} oData={dataSell}/>}
            {showLoading && <Loading/>}       
            <ToastContainer/>
        </div>
    );
}

export default MyCollection;