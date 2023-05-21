import styles from './Market.module.scss';
import classNames from 'classnames/bind';
import Button from '@/components/base/Button';
import PopupDetail from '@/components/base/PopupDetail';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import Select from 'react-select';
import TradeAPI from '@/api/trade';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/components/base/Loading';
import Metamask from '@/api/metamask';
import CopyrightAPI from '@/api/copyright';

const cx = classNames.bind(styles);

function Market({callBackUpdate, searchKey, isSearchData}) {
    const [showLoading, setShowLoading] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [paramOrder, setParamOrder] = useState(0);
    const [statusOrder, setStatusOrder] = useState({value: 0, label: 'Time'}) 
    const [searchValue, setSearchValue] = useState(searchKey)
    const [listSell, setListSell] = useState([])
    const [selectedItem, setSelectedItem] = useState()
    const [curIndex, setCurIndex] = useState(0)
    const [sellSelectedItem, setSellSelectedItem] = useState([])

    const orderStatus = [
        { value: 0, label: 'Time' },
        { value: 1, label: 'Price' },
    ];

    useEffect(()=>{
        setSearchValue(searchKey)
    }, [searchKey])

    useEffect(()=>{
        getInitData()
        callBackUpdate(false, searchValue)
    }, [])

    useEffect(() => {
        if(isSearchData){
            filterData();
        }
    }, [isSearchData])

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setListSell([...data])
        }
    }

    const handlePagingData = (index) => {
        try{
            return handleGetSell(index);
        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
    }

    const handleGetSell = async (index) => {
        try{
            setShowLoading(true);
            const api = new TradeAPI();
            var param = {
                searchKey: searchValue,
                start : index,
                length : 20,
                typeOrder: paramOrder
            }
            
            var res = await api.getHomeSellPaging(param);
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

    const handleChangeOrderrStatus = (v) => {
        setStatusOrder(v);
        setParamOrder(v.value);
    }

    const filterData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setSelectedItem([...[]])
            setCurIndex(0)
            setListSell([...data])
            setShowFilter(false)
        }
    }

    const loadMoreData = async () => {
        var index = curIndex + 20;
        setCurIndex(index);
        var curData = listSell;
        var data = await handlePagingData(index);
        if(data !== false){
            var merData = [...curData, ...data]
            setListSell([...merData])
        }
    }

    const handleChooseItemSell = (id) => {
        var item = listSell.filter((e, i) => {
            return e.id === id
        })

        setSelectedItem(item[0]);
        setSellSelectedItem([id])
        setShowDetail(true)
    }

    const callBackClose = () => {
        setSellSelectedItem([])
        setSelectedItem(null)
        setShowDetail(false)
    }

    const handleBuyImage = async () => {
        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(!check){
            toast.warning("Install metamask extension!");
            return;
        }

        try{

            var checkNetwork = await metamask.checkAcceptNetwork();
            if(!checkNetwork){
                toast.warning("Your current network is not supported.");
                return;
            }

            var address = await metamask.getAddress();
            address = address[0];

            var balance = await metamask.getAccountBalance(address);
            balance = parseInt(balance.toString(), 16)
            var price = Number.parseFloat(selectedItem.price)
            price = price * Math.pow(10, 18);

            if(balance <= price){
                toast.warning("Your balance is not enough.");
                return;
            }

            if(address.substring(2) === selectedItem.user){
                toast.warning("You can't buy image of yourself.");
                return;
            }

            price = decimalToHexString(price)
            var transaction = {
                to: '0x' + selectedItem.user,
                from: address,
                value: price
            }

            setShowLoading(true);

            var result = await metamask.sendTransation(transaction);
            if(result){
                var res = await callServerToUpdateCopyright(selectedItem.user, address.substring(2), selectedItem.imageID, selectedItem.id)
                if(res){
                    setShowDetail(false);
                    filterData();
                }
                else{
                    toast.warning("Something wrong! Please try again.");
                }
            }
            else{
                toast.warning("Something wrong! Please try again.");
            }

        }
        catch(err){
            toast.warning("Metamask connection required!");
        }
    }

    const decimalToHexString = (number) => {
        if (number < 0)
        {
            number = 0xFFFFFFFF + number + 1;
        }

        return "0x" + number.toString(16).toUpperCase();
    }

    const callServerToUpdateCopyright = async (oldKey, newKey, imageID, sellID) => {
        try{
            var api = new CopyrightAPI();
            var res = await api.updateCopyright(oldKey, newKey, imageID, sellID)
            return res.data.success;
        }
        catch(err){
            toast.warning("Something wrong! Please try again.");
        }
    }

    var imageDetail = (
        <div className={cx('content-image-detail', 'd-flex')}>
            <div className={cx('image-content', 'flex-1')}>
                <div className={cx('image')} style={{backgroundImage: selectedItem?.image}}></div>
            </div>
            <div className={cx('detail', 'flex-1', 'd-flex', 'flex-column')}>
                <div className={cx('image-detail', 'flex-1', 'd-flex', 'flex-column')}>
                    <p className={cx('image-detail-title')}>{selectedItem?.caption}</p>
                    <p className={cx('image-detail-detail', 'price')}>Price: {selectedItem?.price} ETH</p>
                    <p className={cx('image-detail-detail')}>{selectedItem?.detail}</p>
                    <p className={cx('image-detail-detail')}>Author: 0x{selectedItem?.user}</p>
                </div>
                <Button className={cx('d-flex')} primary 
                    children={
                        <div className={cx('d-flex', 'align-center', 'justify-center')}>
                            <div className={cx('s-32', 'icon-not-hover', 'i-cart')}></div>
                            <p className={cx('font-size-18', 'font-bold')}>Buy now</p>
                        </div>}

                    onClick={() => handleBuyImage()}        
                >
                    
                </Button>
            </div>
        </div>
    );

    return (
        <div className={cx('content', 'd-flex', 'flex-column')}>
            <div className={cx('content-header', 'd-flex', 'w-full', 'mb-8')} style={{height: "30px"}}>
                <div className={cx('flex-1', 'font-bold', 'font-size-18')}>All collections</div>
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
                                    <div className={cx('font-bold', 'mb-8')}>Order by</div>
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
                    <div className={cx('filter')} onClick={() => {setShowFilter(true)}}></div>
                </Tippy>
            </div>
            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                {
                    listSell.length > 0 ? 
                    (
                        listSell.map((e, index) => {
                            return (
                                <div key={index} className={cx('content-picture','d-flex', 'flex-column', sellSelectedItem.indexOf(e.id) > -1 ? 'active' : '')}
                                    onClick={() => {handleChooseItemSell(e.id)}}
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
            
            
            <div className={cx('see-more', 'd-flex')}>
                <Button className={cx('see-more-btn')} primary onClick={() => {loadMoreData()}}>See more</Button>
            </div>
            {showDetail && <PopupDetail title={"View collection"} child={imageDetail} scale={{height: "90%", width: "65%"}} eventCallBack={() => {callBackClose()}}/>}
            <ToastContainer/>
            {showLoading && <Loading/>}
        </div>
    );
}

export default Market;