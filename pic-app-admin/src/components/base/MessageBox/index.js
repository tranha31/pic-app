import styles from './MessageBox.module.scss';
import classNames from 'classnames/bind';
import Draggable from 'react-draggable';
import Button from '../Button';

const cx = classNames.bind(styles);

function MessageBox({type, title, message, scale, child, eventCallBack}) {

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
                        <div className={cx('icon-popup', type == "warning" ? 'warning' : (type == "error" ? "error" : ""))}></div>
                        <p className={cx('popup-detail-title')}>{title}</p>
                    </div>
                    <div className={cx('popup-detail-body', 'd-flex', 'flex-1', 'flex-column')}>
                        <div className={cx('message', 'flex-1')}>{message}</div>
                        <div className={cx('d-flex')}>
                            <div className={'flex-1'}></div>
                            <Button normal onClick={()=>{closePopup()}}>Cancel</Button>
                            {child}
                        </div>
                    </div>
                </div>
            </Draggable>
            
        </div>
    );
}

export default MessageBox;