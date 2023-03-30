import styles from './Button.module.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Button(
    {
        to, 
        href, 
        normal = false, 
        primary = false, 
        small = false,
        children,
        disabled = false, 
        className,
        icon,
        lefIcon,
        rightIcon,
        onClick, 
        ...passProps
    }
    
    ) {
    let Comp = 'button';
    const props = {
        onClick,
        ...passProps
    }

    if(to){
        props.to = to;
        Comp = Link;
    }
    else if(href){
        props.href = href;
        Comp = "a";
    }

    //Remove event listener when disabled
    if(disabled){
        Object.keys(props).forEach(key => {
            if(key.startsWith('on') && typeof props[key] === 'function'){
                delete props[key];
            }
        })
    }

    const classes = cx('wrapper', 
        {
            [className]: className,
            normal, 
            primary,
            small,
            disabled
        }
    );

    return ( 
        <Comp className={classes} {...props}>
            {lefIcon && <span className={cx('icon', 'icon-left')}>{lefIcon}</span>}
            <span className={cx('title', 'flex-1')}>{children}</span>
            {rightIcon && <span className={cx('icon', 'icon-right')}>{rightIcon}</span>}
        </Comp>
    );
}

export default Button;