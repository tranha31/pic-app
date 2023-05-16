import PopupDetail from "@/components/base/PopupDetail";
import styles from './GalleryImage.module.scss';
import classNames from 'classnames/bind';
import Button from "@/components/base/Button";
import CollectionAPI from "@/api/collection";
import { Fragment, useEffect, useState } from "react";
import Metamask from "@/api/metamask";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function GalleryImage({callBackEvent, showPopup, resetSeletected}) {

    const [show, setShow] = useState(showPopup)
    const [listImage, setListImage] = useState([])
    const [curIndex, setCurIndex] = useState(0)
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
        setShow(showPopup)
    }, [showPopup])

    useEffect(() => {
        getInitData()
    }, [])

    useEffect(()=>{
        if(resetSeletected){
            setSelectedItem(null)
        }
    }, [resetSeletected])

    const getInitData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setListImage([...data])
        }
    }

    const filterData = async () => {
        var data = await handlePagingData(0);
        if(data !== false){
            setListImage([...data])
            setSelectedItem(null)
        }
    }

    const loadMoreData = async () => {
        var index = curIndex + 20;
        setCurIndex(index);
        var curData = listImage;
        var data = await handlePagingData(index);
        if(data !== false){
            var merData = [...curData, ...data]
            setListImage([...merData])
        }
    }

    const handlePagingData = async (index) => {
        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(!check){
            toast.warning("Install metamask extension!");
            return;
        }

        try{
            var address = await metamask.getAddress();
            address = address[0];
            address = address.substring(2);
            return handleGetImage(index, address);

        }
        catch(err){
            toast.warning("Metamask connection required!");
            return false;
        }
        
    }

    const handleGetImage = async (index, address) => {
        try{
            const api = new CollectionAPI();
            var param = {
                key: address,
                start : index,
                length : 20
            }
            
            var res = await api.getImageAllPaging(param);
            if(res.data.success){
                var data = res.data.data;
                var images = [];
                if(data){
                    images = convertDataImage(data);
                    
                }
                return images;
            }
            else{
                toast.error("Something wrong! Please try again!")
                return false;
            }
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
            return false;
        }
    }

    const convertDataImage = (data) => {
        var image = data.map((e, i) => {
            var contentImage = "url('" + e.image + "')";
            return {               
                "imageID" : e.infor.imageID,
                "image" : contentImage
            }
        });

        return image;
    }

    const handleChooseImage = (id) => {
        if(!selectedItem){
            var item = listImage.filter((e, i) => {
                return e.imageID === id
            })
    
            setSelectedItem(item[0])
        }
        else if(selectedItem.imageID === id){
            setSelectedItem(null)
        }
        else{
            var item = listImage.filter((e, i) => {
                return e.imageID === id
            })
    
            setSelectedItem(item[0])
        }
    }

    const closePopup = () =>{
        callBackEvent(0)
    }

    const handleSubmitImage = () => {
        callBackEvent(1, selectedItem)
    }

    const child = (
        <div className={cx('image-wrapper', 'd-flex', 'flex-column', 'w-full')}>
            <div className={cx('list-image-wrapper', 'd-flex', 'w-full')}>
                {
                    listImage.length > 0 ? 
                    (
                        listImage.map((e, index) => {
                            return (
                                <div key={index} className={cx('content-image', selectedItem?.imageID === e.imageID ? 'active' : '')}
                                    onClick={() => {handleChooseImage(e.imageID)}}
                                    data-id={e.imageID}
                                    style={{backgroundImage: e.image}}
                                />
                            )
                        })
                    ) 
                    : 
                    (
                        <div className={cx('empty-data', 'd-flex', 'flex-1', 'flex-column', 'align-center', 'justify-center')}>
                            <div className={cx('i-empty')}></div>
                            <div className={cx('font-bold', 'font-size-18')}>No data</div>
                        </div>
                    )
                }
            </div>
            <div className={cx('d-flex', 'w-full')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => loadMoreData()}>See more</Button>
                <Button normal onClick={() => {closePopup(false)}}>Cancel</Button>
                <Button primary disabled={selectedItem ? '' : 'disabled'} onClick={() => {handleSubmitImage()}}>Submit</Button>
            </div>
            
        </div>
    );
    
    if(show){
        return (
            <div>
                <PopupDetail title={"Choose image"} scale={{height: "95%", width: "85%"}} child={child} eventCallBack={closePopup}/>
                <ToastContainer/>
            </div>
        )
    }
    else{
        return (
            <Fragment></Fragment>
        )
    }
}

export default GalleryImage;