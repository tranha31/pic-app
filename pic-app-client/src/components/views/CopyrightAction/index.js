import styles from './CopyrightAction.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from "react";
import PopupDetail from '@/components/base/PopupDetail';
import Button from '@/components/base/Button';

const cx = classNames.bind(styles);

function CopyrightAction({mode, callBackEvent}) {

    const [title, setTitle] = useState("Copyright registation");

    useEffect(()=>{
        if(mode == 0){
            setTitle("Copyright registation");
        }
        else{
            setTitle("Check image");
        }
    }, [mode])

    const [srcImg, setSrcImg] = useState("");
    const [displayImg, setDisplayImg] = useState(false);

    var styleImage = {
        backgroundImage: `url(${srcImg})`
    }

    const inputRef = useRef(null);

    const chooseImage = () => {
        inputRef.current.click();
    }

    const handlePickImage = (event) => {
        var filePath = inputRef.current.value;
        var allowedExtensions = /(\.png)$/i;
        if(!allowedExtensions.exec(filePath)){
            alert("Please choose image has type .png");
            inputRef.current.value = "";
            return false;
        }

        if(inputRef.current.files && inputRef.current.files[0]){
            var reader = new FileReader();
            reader.onload = function(e){
                setSrcImg(e.target.result);
                setDisplayImg(true);
            }; 
            reader.readAsDataURL(inputRef.current.files[0]);
        }
    }

    const removeImg = () => {
        inputRef.current.value = "";
        setSrcImg("");
        setDisplayImg(false);
    }

    const closePopup = (status) =>{
        callBackEvent(status);
    }

    const child = (
        <div className={cx('copyright-wrapper', 'd-flex', 'flex-column', 'flex-1')}>
            <div className={cx('copyright-content', 'd-flex', 'flex-1')}>
                <input type="file" id='choose-image' className={cx('d-none')} ref={inputRef} onChange={() => {return handlePickImage()}}/>
                {!displayImg ? 
                    (
                        <div className={cx('upload-image', 'd-flex', 'flex-column', 'flex-1', 'justify-center', 'align-center')}>
                            <div className={cx('background-image')} onClick={() => {chooseImage()}}></div>
                            <p className={cx('font-bold')}>Upload image. Only type .png</p>
                        </div>
                    ) : 
                    (
                        <div className={cx('image-content', 'flex-1', 'd-flex','justify-center', 'align-center')}>
                            <div className={cx('img-content')} style={styleImage}></div>
                        </div>
                    )
                }
                
                
            </div>
            <div className={cx('copyright-footer', 'd-flex')}>
                <div className={cx('flex-1')}></div>
                <Button normal onClick={() => {closePopup(false)}}>Cancel</Button>
                {displayImg && <Button normal onClick={removeImg}>Clear image</Button>}
                <Button primary>Submit</Button>
            </div>
        </div>
    );

    return ( 
        <div>
            <PopupDetail title={title} scale={{height: "90%", width: "55%"}} child={child} eventCallBack={closePopup}/>
        </div>
    );
}

export default CopyrightAction;