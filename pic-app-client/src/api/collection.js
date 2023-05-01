import init from "./init";

class CollectionAPI {
    constructor() {
        this.controler = "Collection";
    }

    /**
     * Lấy danh sách yêu cầu đăng ký
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    async getRegisterRequestPaging(param){
        return await init.get(`${this.controler}/register/request/paging`, {params: param});
    }

}

export default CollectionAPI