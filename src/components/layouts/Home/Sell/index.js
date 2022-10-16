import styles from './Sell.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Sell() {
    return (
        <div className={cx('sell-content')}>
            Sell
        </div>
    );
}

export default Sell;