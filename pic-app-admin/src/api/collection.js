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

    /**
     * Lấy ảnh tương đồng của request bị từ chối
     * @param {*} param: dk tim kiem 
     */
    async getImageSimilar(param){
        return await init.get(`${this.controler}/image/similar`, {params: param});
    }

    /**
     * Lấy ds user
     * @param {*} param 
     * @returns 
     */
    async getUserPaging(param){
        try{
            var res = await init.get(`${this.controler}/user/paging`, {params: param});
            return res;
        }
        catch(err){
            return err;
        }
    }
}

export default CollectionAPI