import PopupDetail from '@/components/base/PopupDetail';
import styles from './AuctionDetail.module.scss';
import classNames from 'classnames/bind';
import Input from '@/components/base/Input';
import Button from '@/components/base/Button';
import { useState } from 'react';

const cx = classNames.bind(styles);

function AuctionDetail({eventCallBack}) {

    const [startDate, setStartDate] = useState(new Date("2023/04/02"));
    const [endDate, setEndDate] = useState(new Date("2023/04/30 23:59:59"));
    const [timeRDay, setTimeRDay] = useState("");
    const [timeRHour, setTimeRHour] = useState("");
    const [timeRMinute, setTimeRMinute] = useState("");
    const [timeRSecond, setTimeRSecond] = useState("");

    const countDown = setInterval(() => {
        var now = new Date().getTime();
        var timeleft = endDate.getTime() - now;
        var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
        if(timeleft < 0){
            clearInterval(countDown);
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        }
        setTimeRDay(days);
        setTimeRHour(hours)
        setTimeRMinute(minutes)
        setTimeRSecond(seconds)
    }, 1000);

    const child = (
        <div className={cx('auction-detail-wrapper', 'd-flex', 'w-full')}>
            <div className={cx('auction-image', 'flex-1', 'd-flex')}>
                <div className={cx('image')}></div>
            </div>
            <div className={cx('auction-detail', 'flex-2', 'flex-column')}>
                <div className={cx('highest-info', 'w-full')}>
                    <div className={cx('highest-price', 'font-bold')}>Highest price: 10 eth</div>
                    <div className={cx('')}>Person: 0xAB5545946979996313</div>
                </div>
                <div className={cx('timing')}>
                    <div className={cx('')}>Start time: {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}</div>
                    <div className={cx('')}>End time: {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}</div>
                    <div className={cx('time-remaing', 'font-bold', 'font-size-18')}>Time remaining: {timeRDay} days {timeRHour} hours {timeRMinute} minutes {timeRSecond} seconds</div>
                </div>
                <div className={cx('your-bet')}>
                    <div className={cx('cur-bet', 'font-bold', 'font-size-18')} style={{marginBottom: "15px"}}>Your bet: 10 eth</div>
                    <div className={cx('new-bet-wrapper')}>
                        <Input isNumber isCurrency notNull title={"Enter value"} className={'w-half'}/>
                        <Button primary>Submit</Button>
                    </div>
                </div>
                <p className={cx('font-bold')} style={{marginTop: "10px"}}>History</p>
                <div className={cx('history', 'd-flex', 'flex-column')}>
                    <div className={cx('history-detail')}>
                        <div className={cx('font-bold')}>10 eth</div>
                        <div>Person: 0xAB5545946979996313</div>
                        <div>02/04/2023 00:00:00</div>
                    </div>
                    <div className={cx('history-detail')}>
                        <div className={cx('font-bold')}>10 eth</div>
                        <div>Person: 0xAB5545946979996313</div>
                        <div>02/04/2023 00:00:00</div>
                    </div>
                </div>
            </div>
        </div>
    )

    return ( 
        <div>
            <PopupDetail title={"Auction room"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={eventCallBack}/>
        </div>
    );
}

export default AuctionDetail;