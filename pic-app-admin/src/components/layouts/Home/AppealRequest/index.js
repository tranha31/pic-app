import { useState } from 'react';
import Navigation from '../../../base/Navigation';
import styles from './AppealRequest.module.scss';
import classNames from 'classnames/bind';
import DatePicker from "react-datepicker";
import Button from '../../../base/Button';
import PopupDetail from '../../../base/PopupDetail';

const cx = classNames.bind(styles);

function AppealRequest() {

    const [numberPerPage, setNumberPerPage] = useState({ value: '30', label: '30' })
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())

    const [showDetail, setShowDetail] = useState(false)

    const changePage = (obj) => {
        if(obj.type == 0){
            setNumberPerPage(obj.value)
        }
    }

    const eventCallBack = (state) => {
        setShowDetail(false)
    }

    const child = (
        <div className={cx('detail-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('content', 'd-flex')}>
                <div className={cx('flex-1', 'd-flex', 'wrapper-content', 'align-center', 'justify-center', 'flex-column')} style={{marginRight: "15px"}}>
                    <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "15px"}}>Requested image</div>
                    <div className={cx('image-request')}></div>
                </div>
                <div className={cx('flex-2', 'd-flex', 'flex-column', 'wrapper-content')}>
                    <div className={cx('font-bold', 'font-size-18')}>Similar images</div>
                    <div className={cx('flex-1', 'd-flex', 'image-similar')}>
                        <div className={cx('item-similar')}></div>
                        <div className={cx('item-similar')}></div>
                    </div>
                </div>
            </div>
            <div className={cx('footer', 'd-flex', 'w-full')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => setShowDetail(false)}>Cancel</Button>
                <Button normal>Reject</Button>
                <Button primary>Accept</Button>
            </div>
        </div>
    )

    return ( 
        <div className={cx('request-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('content', 'd-flex', 'flex-1', 'flex-column')}>
                <div className={cx('header', 'd-flex', 'w-full', 'flex-column')}>
                    <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "18px"}}>Appeal Request</div>
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
                    </div>
                </div>

                <div className={cx('tb-wrapper', 'flex-1')}>
                    <table className={cx('table-header', 'w-full')}>
                        <tr>
                            <th className={cx('td-stt')}>STT</th>
                            <th className={cx('td-author')}>Author</th>
                            <th className={cx('td-date')}>Created date</th>
                            <th className={cx('td-function')}></th>
                        </tr>
                    </table>
                    <table className={cx('table-content', 'w-full')}>
                        <tr>
                            <td className={cx('td-stt')}>1</td>
                            <td className={cx('td-author')}>0xABC55454545454545454544</td>
                            <td className={cx('td-date')}>01/01/2023</td>
                            <td className={cx('td-function')}>
                                <div onClick={() => {setShowDetail(true)}}>View</div>
                            </td>
                        </tr>
                        <tr>
                            <td className={cx('td-stt')}>2</td>
                            <td className={cx('td-author')}>0xABC55454545454545454544</td>
                            <td className={cx('td-date')}>01/01/2023</td>
                            <td className={cx('td-function')}>
                                <div onClick={() => {setShowDetail(true)}}>View</div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <Navigation value={numberPerPage} totalRecord={100} onCallBack={changePage}/>
            {showDetail && <PopupDetail title={"Request detail"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={eventCallBack}/>}
            
        </div>
    );
}

export default AppealRequest;