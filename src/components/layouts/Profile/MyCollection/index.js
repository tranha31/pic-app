import Button from '@/components/base/Button';
import styles from './MyCollection.module.scss';
import classNames from 'classnames/bind';
import { Fragment, useState } from 'react';
import MyAuction from './MyAuction';
import ParticipatingRoom from './ParticipantingRoom';

const cx = classNames.bind(styles);

function MyCollection() {

    const [tab, setTab] = useState(2);

    const goToTab = (index) => {
        setTab(index);
    }

    return ( 
        <div className={cx('collection-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('tab-wrapper', 'd-flex', 'w-full')}>
                <div className={cx('tab-item', tab == 0 ? 'active' : "")} onClick={() => {goToTab(0)}}>Collection</div>
                <div className={cx('tab-item', tab == 1 ? 'active' : "")} onClick={() => {goToTab(1)}}>Images for sale</div>
                <div className={cx('tab-item', tab == 2 ? 'active' : "")} onClick={() => {goToTab(2)}}>My Auction room</div>
                <div className={cx('tab-item', tab == 3 ? 'active' : "")} onClick={() => {goToTab(3)}}>Participating Auction room</div>
            </div>

            <div className={cx('collection-content', 'd-flex', 'flex-column', 'flex-1')}>
                { tab == 0 && (
                    <Fragment>
                        <div className={cx('list-image', 'd-flex', 'flex-column')}>
                            <div className={cx('content-container', 'd-flex', 'flex-1')}>
                                <div className={cx('content-image', 'active')}></div>
                                <div className={cx('content-image')}></div>
                            </div>
                        </div>

                        <div className={cx('sell-content-footer', 'd-flex', 'w-full')}>
                            <div className={cx('flex-1')}></div>
                            <Button normal>See more</Button>
                            <Button primary>Sell</Button>
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
        </div>
    );
}

export default MyCollection;