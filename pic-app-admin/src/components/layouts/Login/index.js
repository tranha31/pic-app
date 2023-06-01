import { useState } from 'react';
import Button from '../../base/Button';
import styles from './Login.module.scss';
import classNames from 'classnames/bind';
import Draggable from 'react-draggable';
import LoginAPI from '../../../api/login';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if(!username || !password){
            return
        }

        try{
            var api = new LoginAPI();
            var pass = btoa(password);
            var res = await api.login(username, pass);
            if(res.data.token){
                setCookie("picapp", res.data.token);
                navigate("/");
            }
            else{
                toast.error("Incorrect account");
            }
        } 
        catch(err){
            console.log(err);
            toast.error("Incorrect account");
        }
    }

    const setCookie = (name, token) => {
        var date = new Date();
        date.setTime(date.getTime() + (1*24*60*60*1000));
        var expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + (token || "")  + expires + "; path=/";
    }

    return ( 
        <div className={cx('login-wrapper', 'd-flex', 'justify-center', 'align-center')}>
            <div className={cx('black-background')}></div>
            <Draggable bounds='parent' >
                <div className={cx('popup-detail-content', 'd-flex', 'flex-column')}>
                    <div className={cx('title')}>PICBIN Manager</div>
                    <div className={cx('d-flex', 'flex-1', 'flex-column')}>
                        <div className={cx('item', 'd-flex', 'flex-column', 'w-full')}>
                            <div className={cx('font-bold')}>Username</div>
                            <input className={cx('input')} value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className={cx('item', 'd-flex', 'flex-column', 'w-full')}>
                            <div className={cx('font-bold')}>Password</div>
                            <input type='password' className={cx('input')} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                    </div>
                    <Button primary onClick={() => handleLogin()}>Login</Button>
                </div>
            </Draggable>
            <ToastContainer/>
        </div>
    );
}

export default Login;