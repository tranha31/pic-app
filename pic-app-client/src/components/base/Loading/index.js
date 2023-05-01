import styles from './Loading.module.scss';
import classNames from 'classnames/bind';
import loading from "../../../assets/imgs/processing.gif"

const cx = classNames.bind(styles);

function Loading() {
    return ( 
        <div className={cx('loading-ui-wrapper', 'd-flex', 'justify-center', 'align-center')}>
            <div className={cx('black-background')}></div>
            <div className={cx('loading-body')}>
                <img src={loading} className={cx('processing')} alt="loading..." />
            </div>
        </div>
    );
}

export default Loading;