import styles from './CopyrightAction.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from "react";
import PopupDetail from '@/components/base/PopupDetail';
import Button from '@/components/base/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CopyrightAPI from '@/api/copyright';
import Loading from '@/components/base/Loading';
import MessageBox from '@/components/base/MessageBox';
import Metamask from '@/api/metamask';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function CopyrightAction({mode, callBackEvent}) {
    const location = useLocation();

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
    const [showLoading, setShowLoading] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState()

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
        setSrcImg("");
        callBackEvent(status);
    }

    const submitAction = () => {
        if(validateImage()){
            var imageData = srcImg.split("data:image/png;base64,")[1];

            if(mode === 0){
                handleRegister(imageData);
            }
            else{
                handleCheckCopyright(imageData);
            }
        }
        else{
            toast.warning("Image is too small!!");
        }
    }

    const validateImage = () => {
        var image = new Image();
        image.src = srcImg;

        if(image.width < 144 || image.height < 144){
            return false;
        }
        else{
            return true;
        }
    }

    const handleRegister = async (imageData) => {
        const metamask = new Metamask();
        var check = await metamask.checkConnect();
        if(!check){
            toast.warning("Install metamask extension!");
            return;
        }

        // var checkNetwork = await metamask.checkAcceptNetwork();
        // if(!checkNetwork){
        //     toast.warning("Your current network is not supported.");
        //     return;
        // }
        
        try{
            var address = await metamask.getAddress();
            address = address[0];
            address = address.substring(2);

            setShowLoading(true);
            const api = new CopyrightAPI();
            var request = {
                "sign": address,
                "image": imageData
            }
            request = JSON.stringify(request)
            var response = await api.addNewRegisterRequest(request)
            if(response.data.success){
                toast.success("Request sent successfully. Please wait for admin to process!")
                if(location.pathname === "/my_request"){
                    document.getElementById("reload-request").click()
                }
            }
            else{
                toast.error("Something wrong! Please try again!")
            }

            setShowLoading(false);

        }
        catch(err){
            toast.warning("Metamask connection required!");
        }
    }

    const handleCheckCopyright = async (imageData) =>{
        setShowLoading(true);
        try {
            
            const api = new CopyrightAPI();
            var request = {
                "image" : imageData
            }
            request = JSON.stringify(request)

            const res = await api.checkCopyright(request);
            var response = res.data;
            if(response.success){
                var data = response.data;
                data = data.replaceAll("'", "\"")
                data = JSON.parse(data)
                data = data.map((e, i) => {
                    return "0x" + e;
                })
                
                var msg = (
                    <div className={cx('d-flex', 'flex-column')}>
                        <div className={cx('d-flex', 'flex-column', 'flex-1')}>
                            <div style={{fontWeight: "700", paddingBottom: "10px"}}>List of signatures found in the image:</div>
                            <ul style={{paddingLeft: "30px"}}>
                                {data.map((e, i) => {
                                    return <li>{e}</li>;
                                })}
                            </ul>
                        </div>
                        <div style={{fontStyle: "italic", paddingTop: "10px", textDecoration: "underline"}}>The results are for reference only</div>
                    </div>
                )
                                
                setMessage(msg);
                setShowMessage(true);
            }
            else{
                if(response.error == "Image cannot be greyscale"){
                    toast.error("Image cannot be greyscale.")
                }
                else{
                    toast.error("Something wrong! Please try again!")
                }
            }
        }
        catch(err){
            toast.error("Something wrong! Please try again!")
        }

        setShowLoading(false);
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
                <Button primary disabled={!displayImg} onClick={submitAction}>Submit</Button>
            </div>
        </div>
    );

    return ( 
        <div>
            <PopupDetail title={title} scale={{height: "90%", width: "55%"}} child={child} eventCallBack={closePopup}/>
            {showLoading && <Loading />}
            {showMessage && <MessageBox title={"Check result"} message={message} scale={{height: "300px", width: "450px"}} eventCallBack={()=>{setShowMessage(false)}}/>}
        </div>
    );
}

export default CopyrightAction;