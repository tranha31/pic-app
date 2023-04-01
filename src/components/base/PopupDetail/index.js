
import styles from './PopupDetail.module.scss';
import classNames from 'classnames/bind';
import Draggable from 'react-draggable';
import {useRef} from 'react';

const cx = classNames.bind(styles);

function PopupDetail({title, child, scale, eventCallBack}) {
    const style = { width: scale.width, height: scale.height };

    const closePopup = () => {
        eventCallBack(false);
    }

    return (  
        <div className={cx('popup-detail-ui-wrapper', 'd-flex', 'justify-center', 'align-center')}>
            <div className={cx('black-background')}></div>
            <Draggable bounds='parent' >
                <div className={cx('popup-detail-content', 'd-flex', 'flex-column')} style={style}>
                    <div className={cx('popup-detail-header', 'd-flex')}>
                        <p className={cx('popup-detail-title')}>{title}</p>
                        <div className={cx('flex-1')}></div>
                        <div className={cx('popup-detail-close', 's-24', 'icon', 'i-delete')} onClick={()=>{closePopup();}}></div>
                    </div>
                    <div className={cx('popup-detail-body', 'd-flex')}>
                        {child}
                    </div>
                </div>
            </Draggable>
            
        </div>
    );
}

export default PopupDetail;