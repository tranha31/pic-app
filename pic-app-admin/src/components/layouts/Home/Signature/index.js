import styles from './Signature.module.scss';
import classNames from 'classnames/bind';
import DatePicker from "react-datepicker";
import Navigation from '../../../base/Navigation';
import Button from '../../../base/Button';
import { useState } from 'react';

const cx = classNames.bind(styles);

function Signature() {

    const [numberPerPage, setNumberPerPage] = useState({ value: '30', label: '30' })

    const changePage = (obj) => {
        if(obj.type == 0){
            setNumberPerPage(obj.value)
        }
    }

    return ( 
        <div className={cx('signature-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('header', 'd-flex', 'w-full', 'justify-center', 'flex-column')}>
                <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "10px"}}>List of signatures</div>
                <div className={cx('d-flex', 'w-full')}>
                    <input className={cx('search')} placeholder='Enter public key to search'/>
                    <Button primary>Find</Button>
                </div>
            </div>
            <div className={cx('content', 'd-flex', 'flex-1', 'flex-column')} style={{padding: "10px"}}>
                <table>
                    <tr>
                        <th style={{width: "100px"}}>STT</th>
                        <th>Author</th>
                        <th style={{width: "200px"}}>Number image</th>
                    </tr>
                    
                </table>

                <table className={cx('tb-content')} style={{overflow: "auto"}}>
                    <tr>
                        <td style={{width: "100px", textAlign: "center"}}>1</td>
                        <td>0xABC55454545454545454544</td>
                        <td style={{width: "200px", textAlign: "center"}}>100</td>
                    </tr>
                    <tr>
                        <td style={{width: "100px", textAlign: "center"}}>1</td>
                        <td>0xABC55454545454545454544</td>
                        <td style={{width: "200px", textAlign: "center"}}>100</td>
                    </tr>
                </table>
            </div>
            <Navigation value={numberPerPage} totalRecord={100} onCallBack={changePage}/>
        </div>
    );
}

export default Signature;