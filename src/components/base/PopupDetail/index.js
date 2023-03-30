
import styles from './PopupDetail.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function PopupDetail({title, child}) {
    return (  
        <div className={cx('popup-detail-ui-wrapper', 'd-flex', 'justify-center', 'align-center')}>
            <div className={cx('black-background')}></div>
            <div className={cx('popup-detail-content', 'd-flex', 'flex-column')}>
                <div className={cx('popup-detail-header', 'd-flex')}>
                    <p className={cx('popup-detail-title')}>{title}</p>
                    <div className={cx('flex-1')}></div>
                    <div className={cx('popup-detail-close', 's-24', 'icon', 'i-delete')}></div>
                </div>
                <div className={cx('popup-detail-body')}>
                    {child}
                </div>
            </div>
        </div>
    );
}

export default PopupDetail;