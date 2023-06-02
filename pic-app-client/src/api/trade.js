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
    async updateSell(mode, itemID, key, id, name, detail, price){
        return await init.post(`${this.controler}/update/sell`, null, {params: {mode, itemID, key, id, name, detail, price}})
    }

    /**
     * Lấy ds ảnh đang bán của user
     * @param {*} param 
     * @returns 
     */
    async getSellPaging(param){
        return await init.get(`${this.controler}/sell/paging`, {params: param});
    }

    async deleteItemSell(param){
        return await init.delete(`${this.controler}/sell/delete`, {params: param});
    }

    async getItemSellByID(param){
        return await init.get(`${this.controler}/sell/getbyid`, {params: param});
    }

    async getHomeSellPaging(param){
        return await init.get(`${this.controler}/home/sell/paging`, {params: param});
    }

    async getAuctionRoomPaging(param){
        return await init.get(`${this.controler}/auction/room`, {params: param});
    }

    async deleteAuctionRoom(param){
        return await init.delete(`${this.controler}/auction/room`, {params: param});
    }

    async updateAuctionRoom(mode, key, id, imageID, fromDate, toDate, startPrice){
        return await init.post(`${this.controler}/auction/room`, null, {params: {mode, key, id, imageID, fromDate, toDate, startPrice}})
    }

    async getAuctionRoomHomePaging(param){
        return await init.get(`${this.controler}/auction/room/home`, {params: param});
    }

    async getAuctionRoomJoinPaging(param){
        return await init.get(`${this.controler}/auction/room/join`, {params: param});
    }

    async getAuctionRoomHistory(param){
        return await init.get(`${this.controler}/auction/history/getall`, {params: param});
    }

    async addNewHistory(roomID, key, price, action){
        return await init.post(`${this.controler}/auction/room/history`, null, {params: {roomID, key, price, action}})
    }
}

export default TradeAPI