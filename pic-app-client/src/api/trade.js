import init from "./init";

class TradeAPI {
    constructor() {
        this.controler = "Trade";
    }

    /**
     * Thêm mới, sửa ảnh đang bán
     * @param {*} mode 
     * @param {*} itemId 
     * @param {*} key 
     * @param {*} id 
     * @param {*} name 
     * @param {*} detail 
     * @param {*} price 
     * @returns 
     */
    async updateSell(mode, itemId, key, id, name, detail, price){
        return await init.post(`${this.controler}/update/sell`, null, {params: {mode, itemId, key, id, name, detail, price}})
    }

    /**
     * Lấy ds ảnh đang bán của user
     * @param {*} param 
     * @returns 
     */
    async getSellPaging(param){
        return await init.get(`${this.controler}/sell/paging`, {params: param});
    }
}

export default TradeAPI