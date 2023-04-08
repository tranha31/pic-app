import { Fragment } from "react";
import styles from './DefaultLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function DefaultLayout({children}) {
    return ( 
        <Fragment>
            <div className="container">
                <div className="content">
                    {children}
                </div>
            </div>
        </Fragment>
    );
}

export default DefaultLayout;