import Button from '@/components/base/Button';
import styles from './Sell.module.scss';
import classNames from 'classnames/bind';
import { Fragment, useEffect, useRef, useState } from 'react';
import Input from '@/components/base/Input';
import PopupDetail from '@/components/base/PopupDetail';
import TradeAPI from '@/api/trade';
import MessageBox from '@/components/base/MessageBox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Metamask from '@/api/metamask';
import Loading from '@/components/base/Loading';

const cx = classNames.bind(styles);

function Sell({oData, eventCallBackSell}) {
    const [showLoading, setShowLoading] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");
    const [imageName, setImageName] = useState(oData?.caption);
    const [imageDetail, setImageDetail] = useState(oData?.detail);
    const [imagePrice, setImagePrice] = useState(oData?.price);

    const nameRef = useRef(null);
    const detailRef = useRef(null);
    const priceRef = useRef(null);

    useEffect(()=>{
        setImageName(oData?.caption)
        setImageDetail(oData?.detail)
        setImagePrice(oData?.price)
    }, [oData])

    const handleSubmit = () => {
        if (validateBeforeSave()){
            handleSave();
        }
        else{
            setShowMessage(true);
        }
    }

    const validateBeforeSave = () => {
        if(!imageName || !imagePrice){
            setMessage("Name and Price cannot be null!")
            return false;
        }

        if(imageName.length > 255){
            setMessage("Name is too long!")
            return false;
        }

        return true;
    }

    const closePopup = () => {
        if(nameRef.current.getAttribute("error") == "true" || !imageName){
            nameRef.current.focus();
            
        }
        else if(priceRef.current.getAttribute("error") == "true" || !imagePrice){
            priceRef.current.focus();
        }

        setShowMessage(false);

    }

    const handleSave = async () => {
        setShowMessage(false);

        try{
            const metamask = new Metamask();
            var address = await metamask.getAddress();
            address = address[0];
            address = address.substring(2);

            var price = Number.parseFloat(imagePrice)
            const api = new TradeAPI()
            setShowLoading(true);
            var res = await api.updateSell(oData?.editMode, oData?.id, address, oData?.imageID, imageName, imageDetail, price);
            if(res.data.success){
                setShowLoading(false);
                var data = oData;
                data.caption = imageName;
                data.detail = imageDetail;
                data.price = price;
                eventCallBackSell(data);
            }
            else{
                setShowLoading(false);
                toast.error("Something wrong! Please try again!")
            }
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
        }
    }

    var sellContent = (
        <div className={cx('sell-content', 'flex-1')}>
            <div className={cx('step-2', 'd-flex', 'flex-1')}>
                <div className={cx('flex-1', 'd-flex', 'justify-center', 'align-center')}>
                    <div id='image-content' className={cx('image-content')} style={{backgroundImage: oData?.imageContent}}></div>
                </div>
                <div className={cx('detail-content', 'flex-1', 'd-flex', 'flex-column', 'justify-center')}>
                    <p className={cx('detail-content-title', 'font-bold', 'font-size-18')}>Fill information</p>
                    <Input title='Enter name' notNull className='enter-info' val={imageName} callBackChange={(v) => setImageName(v)} inputRef={nameRef}/>
                    <Input title='Enter detail' textArea className='enter-info' val={imageDetail} callBackChange={(v) => setImageDetail(v)} inputRef={detailRef}/>
                    <Input title='Enter price (ETH)' isNumber isCurrency notNull className='enter-info' val={imagePrice} callBackChange={(v) => setImagePrice(v)} inputRef={priceRef}/>
                </div>
            </div>

            <div className={cx('sell-content-footer', 'd-flex', 'flex-1')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => {eventCallBackSell()}}>Close</Button>
                <Button primary onClick={() => {handleSubmit()}}>Submit</Button>
            </div>
        </div>
    )

    const submitBtn = oData?.editMode == 1 ? (
        <Button primary onClick={() => {handleSave()}}>Submit</Button>
    ) : <Fragment></Fragment>

    return (
        <div>
            <PopupDetail title={"Sell detail"} scale={{height: "95%", width: "85%"}} child={sellContent} eventCallBack={eventCallBackSell}/>
            {showMessage && <MessageBox type={"warning"} title={"Warning"} message={message} scale={{height: "200px", width: "450px"}} child={submitBtn} eventCallBack={closePopup}/>}
            {showLoading && <Loading />}
            <ToastContainer/>
        </div>
        
    );
}

export default Sell;