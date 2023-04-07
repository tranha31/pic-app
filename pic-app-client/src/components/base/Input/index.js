import { useEffect, useRef, useState } from 'react';
import styles from './Input.module.scss';
import classNames from 'classnames/bind';
import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'

const cx = classNames.bind(styles);

function Input(
    {
        val,
        title,
        textArea = false,
        isNumber = false,
        notNull = false,
        isCurrency = false,
        disabled = false, 
        className,
        passProps,
    }
) {

    var Comp = "input";

    const props = {
        disabled,
        ...passProps
    }

    if(textArea){
        Comp = "textarea";
    }

    //Remove event listener when disabled
    if(disabled){
        Object.keys(props).forEach(key => {
            if(key.startsWith('on') && typeof props[key] === 'function'){
                delete props[key];
            }
        })
    }

    const classes = cx('input-wrapper', 
        {
            [className]: className
        }
    );

    const [value, setValue] = useState(val);
    const [error, setError] = useState(false);
    const [messageError, setMessageError] = useState("");
    const [classesInput, setClassesInput] = useState(
        cx('input-wrapper', 'w-full', {["number"]: isNumber})
    )
    const inputRef = useRef(null);


    const handleKeyPress = (evt) => {
        if(isNumber){
            var charCode = evt.which ? evt.which : evt.keyCode;
            if(isCurrency && charCode === 46){
                return true;
            }

            if(charCode > 31 && (charCode < 48 || charCode > 57)){
                evt.preventDefault();
            }
            else{
                return true;
            }
            
        }

        return true;
    }

    const handleKeyUp = (e) => {
        if(isCurrency){
            formatCurrency();
        }
        
    }

    const handelBlur = (e) => {
        if(isCurrency){
            formatCurrency("blur")
        }

        if(notNull && !inputRef.current.value){
            setMessageError("This field cannot be null!");
            setError(true);
            setClassesInput(
                cx('input-wrapper', 'w-full', 'error')
            )
        }
        else{
            setMessageError("");
            setError(false);
            setClassesInput(
                cx('input-wrapper', 'w-full')
            )
        }
    }


    const formatNumber = (n) => {
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }


    const formatCurrency = (blur) => {
        var input_val = inputRef.current.value;
        if (input_val === "") { return; }
        
        var original_len = input_val.length;

        var caret_pos = inputRef.current.selectionStart;

        if (input_val.indexOf(".") >= 0) {
            var decimal_pos = input_val.indexOf(".");
            var left_side = input_val.substring(0, decimal_pos);
            var right_side = input_val.substring(decimal_pos);
            left_side = formatNumber(left_side);
            right_side = formatNumber(right_side);
            
            if (blur === "blur") {
                right_side += "00";
            }

            right_side = right_side.substring(0, 2);
            input_val = left_side + "." + right_side;

        } else {
            input_val = formatNumber(input_val);
            
            if (blur === "blur") {
                input_val += ".00";
            }
        }
        
        inputRef.current.value = input_val;

        var updated_len = input_val.length;
        caret_pos = updated_len - original_len + caret_pos;
        inputRef.current.setSelectionRange(caret_pos, caret_pos);
    }

    const ColoredTooltip = () => {
        if(messageError){
            return <span style={{ backgroundColor: "#000", color: "#fff", padding: "5px 10px", borderRadius: "5px"}}>{messageError}</span>
        }
        return null
    }
    
    return ( 
        <div className={classes}>
            <div className={cx('title', 'd-flex')}>
                <p>{title}</p>
                {notNull && <span className={cx('icon-not-null')}>*</span>}
            </div>
            <Tippy
                content={<ColoredTooltip />}
            >
                <Comp 
                    className={classesInput} 
                    {...props} 
                    ref={inputRef}
                    value={value}
                    onKeyPress={handleKeyPress}
                    onKeyUp={handleKeyUp}
                    onBlur={handelBlur}
                />
            </Tippy>
            
        </div>
    );
}

export default Input;