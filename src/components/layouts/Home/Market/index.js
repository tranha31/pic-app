import styles from './Market.module.scss';
import classNames from 'classnames/bind';
import Button from '@/components/base/Button';

const cx = classNames.bind(styles);

function Market() {
    return (
        <div className={cx('content', 'd-flex', 'flex-column')}>
            <div className={cx('content-container', 'd-flex')}>
                <div className={cx('content-picture', 'd-flex', 'flex-column')}>
                    <div className={cx('image')}></div>
                    <div className={cx('info', 'd-flex', 'flex-column')}>
                        <div className={cx('name')}>Test image</div>
                        <div className={cx('price')}>Price: 5 eth</div>
                        <div className={cx('author')}>Author: 0x544846531979656564619</div>
                    </div>
                </div>
            </div>
            
            <div className={cx('see-more', 'd-flex')}>
                <Button className={cx('see-more-btn')} primary>See more</Button>
            </div>
        </div>
    );
}

export default Market;