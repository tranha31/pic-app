import styles from './Signature.module.scss';
import classNames from 'classnames/bind';
import DatePicker from "react-datepicker";
import Navigation from '../../../base/Navigation';
import Button from '../../../base/Button';
import { useEffect, useState } from 'react';
import CollectionAPI from '../../../../api/collection';
import Loading from '../../../base/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function Signature() {

    const [numberPerPage, setNumberPerPage] = useState({ value: '30', label: '30' })
    const [totalRecord, setTotalRecord] = useState(0)
    const [searchKey, setSearchKey] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showLoading, setShowLoading] = useState(false)
    const [lstUser, setLstUser] = useState([])

    useEffect(() =>{
        initData();
    }, [])

    const initData = async () => {
        var data = await handleGetData(0, 30)
        if(data){
            setLstUser([...data])
        }
    }

    const changePage = async (obj) => {
        if(obj.type == 0){
            setNumberPerPage(obj.value)
            var count = Number.parseInt(obj.value.value);
            var data = await handleGetData(currentIndex, count);
            if(data){
                setLstUser([...data])
            }
        }
        else{
            var curPage = obj.value;
            count = Number.parseInt(numberPerPage.value)
            var index = curPage * count;
            setCurrentIndex(index);
            data = await handleGetData(index, count);
            if(data){
                setLstUser([...data])
            }
        }
    }

    const filter = async () => {
        var count = Number.parseInt(numberPerPage.value)
        var data = await handleGetData(currentIndex, count);
        if(data){
            setLstUser([...data])
        }
    }

    const handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            filter();
        }
    }

    const handleChangeSearchKey = (event) => {
        setSearchKey(event.target.value)
    }

    const handleGetData = async (index, count) => {
        setShowLoading(true);
        const api = new CollectionAPI();
        var param = {
            start : index,
            length : count,
            search: searchKey
        }
        
        var res = await api.getUserPaging(param);
        if(res.data.success){
            var data = res.data.data.data;
            var users = convertData(data);

            var totalR = res.data.data.totalRecord;
            setTotalRecord(totalR);

            setShowLoading(false);
            return users;
        }
        else{
            setShowLoading(false);
            toast.error("Something wrong! Please try again!")
            return null;
        }
    }

    const convertData = (data) => {
        var users = data.map((e, i) => {
            return {
                "user": "0x" + e.userPublicKey,
                "numberImage" : e.numberImage,
            }
        })

        return users;
    }

    return ( 
        <div className={cx('signature-wrapper', 'd-flex', 'flex-column')}>
            <div className={cx('header', 'd-flex', 'w-full', 'justify-center', 'flex-column')}>
                <div className={cx('font-bold', 'font-size-18')} style={{marginBottom: "10px"}}>List of signatures</div>
                <div className={cx('d-flex', 'w-full')}>
                    <input className={cx('search')} value={searchKey} placeholder='Enter public key to search' onChange={(e) => {handleChangeSearchKey(e)}} onKeyUp={(e) => {handleKeyPress(e)}}/>
                    <Button primary onClick={() => filter()}>Find</Button>
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
                    <tbody>
                        {lstUser.length > 0 ? (
                            lstUser.map((e, index) => {
                                return (
                                    <tr key={index}>
                                        <td style={{width: "100px", textAlign: "center"}}>{index + 1}</td>
                                        <td>{e.user}</td>
                                        <td style={{width: "200px", textAlign: "center"}}>{e.numberImage}</td>
                                    </tr>
                                )
                                
                            })
                        ) : (
                            <tr>
                                <td colSpan={3}></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Navigation value={numberPerPage} totalRecord={totalRecord} onCallBack={changePage}/>
            {showLoading && <Loading />}
            <ToastContainer/>
        </div>
    );
}

export default Signature;