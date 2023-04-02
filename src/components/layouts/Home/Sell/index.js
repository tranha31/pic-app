import Button from '@/components/base/Button';
import styles from './Sell.module.scss';
import classNames from 'classnames/bind';
import { useRef, useState } from 'react';
import Input from '@/components/base/Input';

const cx = classNames.bind(styles);

function Sell() {

    const [step, setStep] = useState(1);

    const goToStep = () =>{
        if(step == 1){
            setStep(2);
        }
        else{
            //TODO
        }
    }

    return (
        <div className={cx('sell-content', 'flex-1')}>
            {step == 1 && (
                <div className={cx('step-1', 'd-flex', 'flex-column', 'flex-1')}>
                    <div className={cx('step-title', 'font-bold', 'font-size-18')}>Choose the image you want to sell</div>
                    <div className={cx('list-image', 'd-flex', 'flex-column')}>
                        <div className={cx('content-container', 'd-flex', 'flex-1')}>
                            <div className={cx('content-image', 'active')}></div>
                            <div className={cx('content-image')}></div>
                        </div>
                    </div>
                </div>
            )}
            
            {step == 2 && (
                <div className={cx('step-2', 'd-flex', 'flex-1')}>
                    <div className={cx('flex-1', 'd-flex', 'justify-center', 'align-center')}>
                        <div id='image-content' className={cx('image-content')}></div>
                    </div>
                    <div className={cx('detail-content', 'flex-1', 'd-flex', 'flex-column', 'justify-center')}>
                        <p className={cx('detail-content-title', 'font-bold', 'font-size-18')}>Fill information</p>
                        <Input title='Enter name' notNull className='enter-info'/>
                        <Input title='Enter detail' textArea className='enter-info'/>
                        <Input title='Enter price (ETH)' isNumber isCurrency notNull className='enter-info'/>
                        <Input title='Enter amount' isNumber notNull className='enter-info'/>
                    </div>
                </div>

            )}

            

            <div className={cx('sell-content-footer', 'd-flex', 'flex-1')}>
                <div className={cx('flex-1')}></div>
                {step == 1 && (<Button normal>See more</Button>)}
                {step == 2 && (<Button normal onClick={() => {setStep(1);}}>Back</Button>)}
                <Button primary onClick={goToStep}>{step == 1 ? 'Next' : 'Submit'}</Button>
            </div>
        </div>
    );
}

export default Sell;