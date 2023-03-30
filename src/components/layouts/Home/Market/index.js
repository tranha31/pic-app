import styles from './Market.module.scss';
import classNames from 'classnames/bind';
import Button from '@/components/base/Button';
import PopupDetail from '@/components/base/PopupDetail';

const cx = classNames.bind(styles);

function Market() {

    var imageDetail = (
        <div className={cx('content-image-detail', 'd-flex')}>
            <div className={cx('image-content', 'flex-1')}>
                <div className={cx('image')}></div>
            </div>
            <div className={cx('detail', 'flex-1', 'd-flex', 'flex-column')}>
                <div className={cx('image-detail', 'flex-1', 'd-flex', 'flex-column')}>
                    <p className={cx('image-detail-title')}>Test image</p>
                    <p className={cx('image-detail-detail')}>The girl is so cute</p>
                    <p className={cx('image-detail-detail')}>Price: 5 eth</p>
                    <p className={cx('image-detail-detail')}>Author: 0x544846531979656564619</p>
                </div>
                <Button className={cx('d-flex')} primary 
                    children={
                        <div className={cx('d-flex', 'align-center', 'justify-center')}>
                            <div className={cx('s-32', 'icon-not-hover', 'i-cart')}></div>
                            <p className={cx('font-size-18', 'font-bold')}>Buy now</p>
                        </div>}>
                </Button>
            </div>
        </div>
    );

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

            <PopupDetail title={"View image"} child={imageDetail}/>
        </div>
    );
}

export default Market;