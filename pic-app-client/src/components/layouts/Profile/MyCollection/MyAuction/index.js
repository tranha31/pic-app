import Button from '@/components/base/Button';
import styles from './MyAuction.module.scss';
import classNames from 'classnames/bind';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import AddNewAutionDetail from './AddNewAuctionDetail';

const cx = classNames.bind(styles);

function MyAuction() {

    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())

    const [showDetail, setShowDetail] = useState(false);

    return ( 
        <div className={cx('auction-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('auction-header', 'd-flex', 'w-full', 'flex-column')}>
                <div className={cx('filter', 'd-flex', 'w-full')}>
                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker', 'font-bold')}>Start date</p>
                        <DatePicker 
                            className={cx('date-picker')} 
                            dateFormat="dd/MM/yyyy" 
                            selected={startDate} 
                            onChange={(date) => setStartDate(date)} 
                        />
                    </div>

                    <div className={cx('date-picker-wrapper', 'mr-8')}>
                        <p className={cx('title-date-picker', 'font-bold')}>End date</p>
                        <DatePicker 
                            className={cx('date-picker')} 
                            dateFormat="dd/MM/yyyy" 
                            selected={endDate} 
                            onChange={(date) => setEndDate(date)} 
                        />
                    </div>
                    <Button primary className={cx('fit-content')}>Filter</Button>
                    <div className={cx('flex-1')}></div>
                    <Button normal disabled>Delete</Button>
                    <Button normal disabled>Edit</Button>
                    <Button primary onClick={() => {setShowDetail(true)}}>Add new</Button>
                </div>
                
            </div>
            <div className={cx('auction-content', 'w-full', 'd-flex')}>
                <div className={cx('content-auction', 'd-flex', 'flex-column', 'active')}>
                    <div className={cx('image')}></div>
                    <div className={cx('info', 'd-flex', 'flex-column')}>
                        <div className={cx('highest-price')}>Highest price: 10 eth</div>
                        <div className={cx('')}>Start time: 02/04/2023 00:00:00</div>
                        <div className={cx('')}>End time: 04/04/2023 23:59:59</div>
                        
                    </div>
                </div>
                <div className={cx('content-auction', 'd-flex', 'flex-column')}>
                    <div className={cx('image')}></div>
                    <div className={cx('info', 'd-flex', 'flex-column')}>
                        <div className={cx('highest-price')}>Highest price: 10 eth</div>
                        <div className={cx('')}>Start time: 02/04/2023 00:00:00</div>
                        <div className={cx('')}>End time: 04/04/2023 23:59:59</div>
                        
                    </div>
                </div>
                
            </div>

            <div className={cx('see-more', 'd-flex', 'flex-1', 'justify-center')}>
                <Button className={cx('see-more-btn')} primary>See more</Button>
            </div>

            {showDetail && <AddNewAutionDetail callBackEvent={(state) => {setShowDetail(state)}}/>}
        </div>
    );
}

export default MyAuction;