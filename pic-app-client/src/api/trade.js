import init from "./init";

class TradeAPI {
    constructor() {
        this.controler = "Trade";
    }

    async updateSell(mode, itemId, key, id, name, detail, price){
        return await init.post(`${this.controler}/update/sell`, null, {params: {mode, itemId, key, id, name, detail, price}})
    }
}

export default TradeAPI