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


const cx = classNames.bind(styles);

function MyCollection() {

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

    useEffect(() => {
        getInitData();
    }, []);

    useEffect(() => {
        if(tab === 0 && listImage.length === 0){
            handleRefresh();
        }
        // else if(tab === 1 && appealRequests.length === 0){
        //     handleRefresh();
        // }

        setShowFilter(false);
    }, [tab])

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
        var data = await handlePagingData(0);
        if(data !== false){
            if(tab === 0){
                setCurrentImage("")
                setSelectedItem([...[]])
                setListImage([...data])
            }
            else{
            }
        }
    }

    const refreshFilter = () => {
        var curDate = new Date();
        setStartDate(new Date(curDate.setDate(curDate.getDate() - 30)))
        setEndDate(new Date())

        setStatusReq(imageStatus[0]);
        setParamImageStatus(-1);
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
                //return handleGetAppealRequest(index, address);
            }

        }
        catch(err){
            toast.warning("Metamask connection required!");
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

    const handleGoToSell = () => {
        var image = listImage.find((e, i) => {
            return e.id === selectedItem[0];
        })
        setCurrentImage(image.image)
        setShowSellDetail(true);
    }

    const handleCallBackSellDetail = () => {
        setShowSellDetail(false);

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

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Collection</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Images for sale</div>
                <div className={cx('tab-item', tab == 2 ? 'active' : "")} onClick={() => {goToTab(2)}}>My Auction room</div>
                <div className={cx('tab-item', tab == 3 ? 'active' : "")} onClick={() => {goToTab(3)}}>Participating Auction room</div>
                <div className={cx('flex-1')}></div>
                <div className={cx('refresh')} onClick={() => {handleRefresh()}}></div>
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
                        </div>
                        
                    </Fragment>
                    
                )}

                { tab == 1 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex')}>
                            <div className={cx('content-picture', 'd-flex', 'flex-column', 'active')}>
                                <div className={cx('image')}></div>
                                <div className={cx('info', 'd-flex', 'flex-column')}>
                                    <div className={cx('name')}>Test image</div>
                                    <div className={cx('price')}>Price: 5 eth</div>
                                    <div className={cx('author')}>Amount: 10</div>
                                </div>
                            </div>

                            <div className={cx('content-picture', 'd-flex', 'flex-column')}>
                                <div className={cx('image')}></div>
                                <div className={cx('info', 'd-flex', 'flex-column')}>
                                    <div className={cx('name')}>Test image</div>
                                    <div className={cx('price')}>Price: 5 eth</div>
                                    <div className={cx('author')}>Amount: 10</div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full')}>
                            <div className={cx('flex-1')}></div>
                            <Button normal>See more</Button>
                            <Button normal disabled>Delete</Button>
                            <Button normal disabled>Edit</Button>
                        </div>
                    </Fragment>
                )}

                { tab == 2 && (
                    <MyAuction />
                )}

                {tab == 3 && (
                    <ParticipatingRoom />
                )}
                
            </div> 
            {showDetail && <PopupDetail title={"Image"} scale={{height: "85%", width: "65%"}} child={viewImage} eventCallBack={() =>setShowDetail(false)}/>} 
            {showSellDetail && <Sell eventCallBackSell={handleCallBackSellDetail} imageContent={currentImage} imageID={selectedItem[0]}/>}
            {showLoading && <Loading/>}       
            <ToastContainer/>
        </div>
    );
}

export default MyCollection;