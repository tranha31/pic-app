import PopupDetail from "@/components/base/PopupDetail";
import styles from './AddNewAuctionDetail.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from "react";
import Input from "@/components/base/Input";
import DatePicker from "react-datepicker";
import Button from "@/components/base/Button";
import GalleryImage from "../GalleryImage";
import MessageBox from "@/components/base/MessageBox";
import Metamask from "@/api/metamask";
import TradeAPI from "@/api/trade";
import Loading from "@/components/base/Loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function AddNewAutionDetail({callBackEvent, oData}) {
    const [displayImg, setDisplayImg] = useState(false)

    var curDate = new Date();
    const [startDate, setStartDate] = useState(new Date(curDate.setDate(curDate.getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date(curDate.setDate(curDate.getDate() + 60)));

    const [showGallery, setShowGallery] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);

    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");

    const [showLoading, setShowLoading] = useState(false);

    const [resetImage, setResetImage] = useState(false);
    const [price, setPrice] = useState(0);

    const priceRef = useRef(null);

    useEffect(()=>{
        setPrice(oData?.startPrice)
        setStartDate(oData?.startDate)
        setEndDate(oData?.endDate)
        setCurrentImage(oData?.currentImage)
        if(oData?.currentImage){
            setDisplayImg(true)
        }
    }, [oData])

    const closePopup = (status) =>{
        callBackEvent(0);
    }

    const closeGallery = (status, data) => {
        if(status === 0){
            setShowGallery(false)
        }
        else if(status === 1){
            setCurrentImage(data)
            setShowGallery(false)
            setDisplayImg(true)
        }

        setResetImage(false)
    }

    const clearImage = () => {
        setCurrentImage(null)
        setDisplayImg(false)
        setResetImage(true)
    }

    const handleSaveData = () => {
        var check = validateBeforeSave()
        if(check){
            saveData()
        }
        else{
            setShowMessage(true)
        }
    }

    const validateBeforeSave = () => {
        var now = new Date();

        if(!currentImage){
            setMessage("Mandatory image selection.")
            return false;
        }

        if(startDate <= now){
            setMessage("Start time must be greater than current.")
            return false;
        }

        if(endDate <= now){
            setMessage("End time must be greater than current.")
            return false;
        }

        if(startDate >= endDate){
            setMessage("End time must be greater than start time.")
            return false;
        }

        if(!price){
            setMessage("Price invalid.")
            return false;
        }

        setMessage("");
        return true;
    }

    const saveData = async () => {
        try{
            const metamask = new Metamask();
            var checkNetwork = await metamask.checkAcceptNetwork();
            if(!checkNetwork){
                toast.warning("Your current network is not supported.");
                return;
            }

            var address = await metamask.getAddress();
            address = address[0];
            
            var tempPrice = price;
            var startPrice = Number.parseFloat(tempPrice.toString().replaceAll(",",""))
            var startTime = startDate.getTime();
            var endTime = endDate.getTime();
            const api = new TradeAPI()
            setShowLoading(true);
            //Cập nhật smartcontract
            await metamask.connectSmartContract();
            if(oData?.editMode == 0){
                var id = uuidv4();
                await metamask.createAuctionRoom(id, startTime, endTime, startPrice * Math.pow(10, 18), address);
                oData.id = id;
            }
            else{ 
                var now = new Date();
                now = now.getTime();
                await metamask.updateAuctionRoom(oData?.id, startTime, endTime, now, startPrice * Math.pow(10, 18), address);
            }
            address = address.substring(2);
            var res = await api.updateAuctionRoom(oData?.editMode, address, oData?.id, currentImage.imageID, startDate, endDate, startPrice);
            setShowLoading(false);
            if(res.data.success){
                setShowLoading(false);
                callBackEvent(1);
            }
            else{
                setShowLoading(false);
                toast.error("Something wrong! Please try again!")
            }
        }
        catch(err){
            toast.error("Transaction fail! Please try again!");
            setShowLoading(false);
        }
    }

    const uuidv4 = () => {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    const child = (
        <div className={cx('auction-detail-wrapper', 'd-flex', 'w-full')}>
            <div className={cx('auction-image', 'flex-2', 'd-flex')}>
                {!displayImg ? 
                    (
                        <div className={cx('upload-image', 'd-flex', 'flex-column', 'flex-1', 'justify-center', 'align-center')}>
                            <div className={cx('background-image')} onClick={() => {setShowGallery(true)}}></div>
                            <p className={cx('font-bold')}>Choose your image</p>
                        </div>
                    ) : 
                    (
                        <div className={cx('image-content', 'flex-1', 'd-flex','justify-center', 'align-center')}>
                            <div className={cx('img-content')} style={{backgroundImage: currentImage?.image}}></div>
                        </div>
                    )
                }
            </div>
            <div className={cx('auction-detail', 'd-flex', 'flex-1', 'flex-column')}>
                <div className={cx('d-flex', 'w-full')}>
                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker')}>Start date <span style={{color: "red"}}>*</span></p>
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
                        <p className={cx('title-date-picker')}>End date <span style={{color: "red"}}>*</span></p>
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
                </div>
                <Input title='Enter starting price' isNumber isCurrency notNull className='enter-info' inputRef={priceRef} val={price} callBackChange={(v) => setPrice(v)}/>

                <div className={cx('flex-1')}></div>
                <div className={cx('d-flex', 'w-full')}>
                    <div className={cx('flex-1')}></div>
                    {(displayImg && oData?.editMode !== 1) && <Button normal onClick={() => {clearImage()}}>Clear image</Button>}
                    <Button normal onClick={() => {closePopup(false)}}>Cancel</Button>
                    <Button primary onClick={() => {handleSaveData()}}>Save</Button>
                </div>
            </div>
        </div>
    )

    return ( 
        <div>
            <PopupDetail title={"Auction room"} scale={{height: "95%", width: "65%"}} child={child} eventCallBack={closePopup}/>
            <GalleryImage callBackEvent={closeGallery} showPopup={showGallery} resetSeletected={resetImage}/>
            {showMessage && <MessageBox type={"warning"} title={"Warning"} message={message} scale={{height: "200px", width: "450px"}} eventCallBack={()=> setShowMessage(false)}/>}
            {showLoading && <Loading/>}
        </div>
    );
}

export default AddNewAutionDetail;