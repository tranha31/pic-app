import init from "./init";

class CollectionAPI {
    constructor() {
        this.controler = "Collection";
    }
    
    /**
     * Lấy danh sách yêu cầu kháng cáo
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    async getAllAppealRequestPaging(param){
        return await init.get(`${this.controler}/appeal/request/all/paging`, {params: param});
    }
}

export default CollectionAPI