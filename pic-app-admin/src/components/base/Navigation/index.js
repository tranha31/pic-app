import styles from './Navigation.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import Select from 'react-select'

const cx = classNames.bind(styles);

function Navigation({value, totalRecord, onCallBack}) {

    const options = [
        { value: '10', label: '10' },
        { value: '30', label: '30' },
        { value: '50', label: '50' },
        { value: '100', label: '100' },
    ];

    const totalPage = Math.ceil(totalRecord / Number.parseInt(value.value))

    const [lstPage, setLstPage] = useState(() => {
        var btn = []
        if(totalPage < 5){
            for(var i=1; i<=totalPage; i++){
                btn.push({page: i, active: false})
            }
        }
        else{
            for(i=1; i<=5; i++){
                btn.push({page: i, active: false})
            }
        }
        btn[0].active = true;
        return btn; 
    })

    useEffect(() => {
        var btn = setDefaultListPage();
        setLstPage(...[btn])
    }, [totalRecord, value])

    const setDefaultListPage = () => {
        var btn = []
        if(totalPage < 5){
            for(var i=1; i<=totalPage; i++){
                btn.push({page: i, active: false})
            }
        }
        else{
            for(i=1; i<=5; i++){
                btn.push({page: i, active: false})
            }
        }
        btn[0].active = true;
        return btn;
    }

    const changeSize = (v) => {
        var obj = {
            type : 0,
            value: v
        }
        onCallBack(obj)
    }

    const choosePage = (index) => {
        if(totalPage <= 5){
            var btn = []
            for(var i=1; i<=totalPage; i++){
                btn.push({page: i, active: false})
            }
            btn[index - 1].active =true;
            setLstPage(...[btn])
        }
        else{
            var btn = [];
            if(index + 5 <= totalPage){
                if(index - 2 <= 0){
                    for(var i=1; i<=5; i++){
                        if(i == index){
                            btn.push({page: i, active: true})
                        }
                        else{
                            btn.push({page: i, active: false})
                        }
                    }
                }
                else{
                    for(i=index-2; i<=index+2; i++){
                        if(i == index){
                            btn.push({page: i, active: true})
                        }
                        else{
                            btn.push({page: i, active: false})
                        }
                    }
                }
                
            }
            else{
                if(index + 2 >= totalPage){
                    for(i=totalPage; i > totalPage-5; i--){
                        if(i == index){
                            btn.push({page: i, active: true})
                        }
                        else{
                            btn.push({page: i, active: false})
                        }
                    }
                    btn = btn.reverse();
                }
                else{
                    for(i=index-2; i<=index+2; i++){
                        if(i == index){
                            btn.push({page: i, active: true})
                        }
                        else{
                            btn.push({page: i, active: false})
                        }
                    }
                }
            }

            setLstPage(...[btn])
        }
    }

    

    return ( 
        <div className={cx('navigation-wrapper', 'd-flex', 'w-full')}>
            <div className={cx('total-record', 'flex-1')}>
                Tổng số: {totalRecord}
            </div>
            <Select 
                options={options} 
                isSearchable={false}
                defaultValue={options[1]}
                value={value}
                menuPlacement='auto'
                onChange={(v) => changeSize(v)}
            />
            <div className={cx('btn-navigaiton', 'd-flex')}>
                <div className={cx('item-navigiton')} onClick={() => choosePage(1)}>&lt;&lt;</div>
                {lstPage.map((page, index) => {
                    var isActive = page.active;
                    return (
                        <div key={index} className={cx('item-navigiton', isActive ? 'active' : '')} onClick={() => choosePage(page.page)}>{page.page}</div>
                        
                        );  
                    })
                }
                <div className={cx('item-navigiton')} onClick={() => choosePage(totalPage)}>&gt;&gt;</div>
            </div>
        </div>
    );
}

export default Navigation;