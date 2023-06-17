import PopupDetail from '@/components/base/PopupDetail';
import styles from './AuctionDetail.module.scss';
import classNames from 'classnames/bind';
import Input from '@/components/base/Input';
import Button from '@/components/base/Button';
import { useEffect, useRef, useState } from 'react';
import TradeAPI from '@/api/trade';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Metamask from '@/api/metamask';
import Loading from '@/components/base/Loading';

const cx = classNames.bind(styles);

function AuctionDetail({eventCallBack, oData}) {
    const [oAuctionData, setOAuctionData] = useState(oData);
    const [timeRDay, setTimeRDay] = useState("");
    const [timeRHour, setTimeRHour] = useState("");
    const [timeRMinute, setTimeRMinute] = useState("");
    const [timeRSecond, setTimeRSecond] = useState("");

    const [history, setHistory] = useState([]);
    const [yourBet, setYourBet] = useState(0);

    const [amount, setAmount] = useState(0);
    const [showLoading, setShowLoading] = useState(false);

    const amountRef = useRef(null);

    const countDown = setInterval(() => {
        var now = new Date().getTime();
        var timeleft = new Date(oAuctionData?.endTime).getTime() - now;
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

    useEffect(()=>{
        handleGetHistory();
    }, [])

    useEffect(() => {
        setOAuctionData(oData);
    }, [oData])

    // const getHistory = setInterval(() => {
    //     handleGetHistory();
    // }, 60000);

    const handleCallBack = () => {
        clearInterval(countDown);
        //clearInterval(getHistory);
        eventCallBack();
    }

    const handleGetHistory = async () => {
        if(oAuctionData?.id){
            const metamask = new Metamask();
            var check = await metamask.checkConnect();
            if(!check){
                toast.warning("Install metamask extension!");
                return;
            }

            var checkNetwork = await metamask.checkAcceptNetwork();
            if(!checkNetwork){
                toast.warning("Your current network is not supported.");
                return;
            }

            if(!oAuctionData?.id){
                return;
            }
            var address = await metamask.getAddress();
            address = address[0];
            address = address.substring(2);

            try{
                var api = new TradeAPI();
                var param = {
                    roomID : oAuctionData?.id
                }
                var res = await api.getAuctionRoomHistory(param);
                if(res.data.success){
                    var data = res.data.data;
                    var yourAmount = 0;
                    for(var i=0; i<data.length; i++){
                        if(data[i].userPublicKey === address){
                            yourAmount += data[i].price;
                        }
                    }
                    setYourBet(yourAmount);
                    setHistory(...[]);
                    setHistory([...data]);
                }
                else{
                    //toast.warning("Cannot get history!");
                }
            }
            catch(err){
                //toast.warning("Cannot get history!");
            }
        }
    }

    const handleSubmit = async () => {
        var check = await validateBeforeSubmit();
        if(!check){
            return;
        }

        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(!check){
            toast.warning("Install metamask extension!");
            return;
        }

        try{

            var checkNetwork = await metamask.checkAcceptNetwork();
            if(!checkNetwork){
                toast.warning("Your current network is not supported.");
                return;
            }

            var address = await metamask.getAddress();
            address = address[0];

            var balance = await metamask.getAccountBalance(address);
            balance = parseInt(balance.toString(), 16)
            var price = Number.parseFloat(amount.toString().replaceAll(",", ""))
            price = price * Math.pow(10, 18);

            if(balance <= price){
                toast.warning("Your balance is not enough.");
                return;
            }

            if(address.substring(2) === oAuctionData?.user){
                toast.warning("You can't buy image of yourself.");
                return;
            }

            setShowLoading(true);
            await metamask.connectSmartContract();
            var now = new Date();
            now = now.getTime();
            await metamask.addNewBid(oAuctionData?.id, now, address, price);
            
            var api = new TradeAPI();
            price = price / Math.pow(10, 18);
            var res = await api.addNewHistory(oAuctionData?.id, address.substring(2), price, 0);
            if(res.data.success){
                var data = oAuctionData;
                data.highestBeter = address.substring(2);
                data.highestPrice = yourBet + price;

                setYourBet(yourBet + price)
                setOAuctionData(data);
                setAmount(null);
                handleGetHistory();
            }
            else{
                toast.warning("Something wrong! Please try again.");
            }

            setShowLoading(false);
        }
        catch(err){
            toast.warning("Transaction fail! Please try again!");
            setShowLoading(false);
        }
    }

    const validateBeforeSubmit = async () => {
        var now = new Date();
        if(now < new Date(oAuctionData?.startTime)){
            toast.warning("Auction is not started!");
            return false;
        }

        if(now > new Date(oAuctionData?.endTime)){
            toast.warning("Auction is ended!");
            return false;
        }

        if(amountRef.current.getAttribute("error") == "true" || !amount){
            amountRef.current.focus();
            toast.warning("Price cannot be null!");
            return false;
        }

        const metamask = new Metamask();
        var address = await metamask.getAddress();
        address = address[0];
        var yourAmount = 0;
        for(var i=0; i<history.length; i++){
            if(history[i].userPublicKey === address){
                yourAmount += history[i].price;
            }
        }

        if(!(yourAmount + Number.parseFloat(amount.toString().replaceAll(",", "")) > oAuctionData?.startPrice && 
            yourAmount + Number.parseFloat(amount.toString().replaceAll(",", "")) > oAuctionData?.highestPrice
        )){
            amountRef.current.focus();
            toast.warning("Price must be greater than highest price!");
            return false;
        }

        
        return true;
    }

    const child = (
        <div className={cx('auction-detail-wrapper', 'd-flex', 'w-full')}>
            <div className={cx('auction-image', 'flex-1', 'd-flex')}>
                <div className={cx('image')} style={{backgroundImage: oAuctionData?.image}}></div>
            </div>
            <div className={cx('auction-detail', 'flex-2', 'flex-column')}>
                <div className={cx('highest-info', 'w-full')}>
                    <div className={cx('highest-price', 'font-bold')}>Highest price: {oAuctionData?.highestPrice} ETH</div>
                    <div className={cx('mb-8')}>Highest address: 0x{oAuctionData?.highestBeter}</div>
                    <div className={cx('')}>Start price: {oAuctionData?.startPrice} ETH</div>
                </div>
                <div className={cx('timing')}>
                    <div className={cx('')}>Start time: {(new Date(oAuctionData?.startTime)).toLocaleDateString()} {(new Date(oAuctionData?.startTime)).toLocaleTimeString()}</div>
                    <div className={cx('')}>End time: {(new Date(oAuctionData?.endTime)).toLocaleDateString()} {(new Date(oAuctionData?.endTime)).toLocaleTimeString()}</div>
                    <div className={cx('time-remaing', 'font-bold', 'font-size-18')}>Time remaining: {timeRDay} days {timeRHour} hours {timeRMinute} minutes {timeRSecond} seconds</div>
                </div>
                <div className={cx('your-bet')}>
                    <div className={cx('cur-bet', 'font-bold', 'font-size-18')} style={{marginBottom: "15px"}}>Your bet: {yourBet} eth</div>
                    <div className={cx('new-bet-wrapper')}>
                        <Input isNumber isCurrency notNull title={"Enter value"} className={'w-half'} inputRef={amountRef} val={amount} callBackChange={(v) => setAmount(v)}/>
                        <Button primary onClick={() => handleSubmit()}>Submit</Button>
                    </div>
                </div>
                <div className={cx('d-flex', 'w-full')}>
                    <p className={cx('font-bold')} style={{marginTop: "10px"}}>History</p>
                    <div className={cx('refresh')} onClick={() => {handleGetHistory()}}></div>
                </div>
                <div className={cx('history', 'd-flex', 'flex-column')}>
                    {
                        history.map((e, i) => {
                            var time = new Date(e.createdTime);
                            if(e.action === 0){
                                return (
                                    <div className={cx('history-detail')} key={i}>
                                        <div className={cx('font-bold')}>{e.price.toString()} eth</div>
                                        <div>Address: 0x{e.userPublicKey}</div>
                                        <div>{time.toLocaleDateString()} {time.toLocaleTimeString()}</div>
                                    </div>
                                )
                            }
                            else{
                                return(
                                    <div className={cx('history-detail')} key={i}>
                                        <div className={cx('font-bold')}>Withdraw</div>
                                        <div>Address: 0x{e.userPublicKey}</div>
                                        <div>{time.toLocaleDateString()} {time.toLocaleTimeString()}</div>
                                    </div>
                                )
                                
                            }
                        })
                    }
                    
                </div>
            </div>
        </div>
    )

    return ( 
        <div>
            <PopupDetail title={"Auction room"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={handleCallBack}/>
            {showLoading && <Loading/>}
        </div>
    );
}

export default AuctionDetail;