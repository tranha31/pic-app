import PopupDetail from "@/components/base/PopupDetail";
import styles from './AddNewAuctionDetail.module.scss';
import classNames from 'classnames/bind';
import { useState } from "react";
import Input from "@/components/base/Input";
import DatePicker from "react-datepicker";
import Button from "@/components/base/Button";
import GalleryImage from "../GalleryImage";

const cx = classNames.bind(styles);

function AddNewAutionDetail({callBackEvent}) {
    const [displayImg, setDisplayImg] = useState(false)
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [showGallery, setShowGallery] = useState(false);

    const closePopup = (status) =>{
        callBackEvent(status);
    }

    const closeGallery = (status) => {
        setShowGallery(status)
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
                            <div className={cx('img-content')}></div>
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
                            dateFormat="dd/MM/yyyy" 
                            selected={startDate} 
                            onChange={(date) => setStartDate(date)} 
                        />
                    </div>

                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker')}>End date <span style={{color: "red"}}>*</span></p>
                        <DatePicker 
                            className={cx('date-picker')} 
                            dateFormat="dd/MM/yyyy" 
                            selected={endDate} 
                            onChange={(date) => setEndDate(date)} 
                        />
                    </div>
                </div>
                <Input title='Enter starting price' isNumber isCurrency notNull className='enter-info'/>

                <div className={cx('flex-1')}></div>
                <div className={cx('d-flex', 'w-full')}>
                    <div className={cx('flex-1')}></div>
                    <Button normal onClick={() => {closePopup(false)}}>Cancel</Button>
                    <Button primary>Save</Button>
                </div>
            </div>
        </div>
    )

    return ( 
        <div>
            <PopupDetail title={"Auction room"} scale={{height: "95%", width: "65%"}} child={child} eventCallBack={closePopup}/>
            {showGallery && <GalleryImage callBackEvent={closeGallery}/>}
        </div>
    );
}

export default AddNewAutionDetail;