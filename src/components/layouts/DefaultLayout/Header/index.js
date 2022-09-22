import styles from './Header.module.scss';
import classNames from 'classnames';

const cx = classNames.bind(styles);

function Header() {
    return <h2 className={cx('header')}>Header</h2>;
}

export default Header;