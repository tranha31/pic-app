import PopupDetail from "@/components/base/PopupDetail";
import styles from './GalleryImage.module.scss';
import classNames from 'classnames/bind';
import Button from "@/components/base/Button";

const cx = classNames.bind(styles);

function GalleryImage({callBackEvent}) {

    const closePopup = (status) =>{
        callBackEvent(status);
    }

    const child = (
        <div className={cx('image-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('list-image-wrapper', 'd-flex', 'flex-column', 'w-full')}>
                <div className={cx('list-image', 'd-flex', 'flex-1')}>
                    <div className={cx('content-image', 'active')}></div>
                    <div className={cx('content-image')}></div>
                </div>
            </div>
            <div className={cx('d-flex', 'w-full')}>
                <div className={cx('flex-1')}></div>
                <Button normal>See more</Button>
                <Button normal onClick={() => {closePopup(false)}}>Cancel</Button>
                <Button primary>Submit</Button>
            </div>
            
        </div>
    );

    return ( 
        <div>
            <PopupDetail title={"Choose image"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={closePopup}/>
        </div>
    );
}

export default GalleryImage;