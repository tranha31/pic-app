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

    /**
     * Lấy ảnh tương đồng của request bị từ chối
     * @param {*} param: dk tim kiem 
     */
    async getImageSimilar(param){
        return await init.get(`${this.controler}/image/similar`, {params: param});
    }

    /**
     * Lấy danh sách yêu cầu kháng cáo
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    async getAppealRequestPaging(param){
        return await init.get(`${this.controler}/appeal/request/paging`, {params: param});
    }

    /**
     * Lấy danh sách yêu cầu kháng cáo
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    async getImagePaging(param){
        return await init.get(`${this.controler}/collection/paging`, {params: param});
    }

    /**
     * Lấy danh sách yêu cầu kháng cáo
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    downloadImage(id){
        var url = `${process.env.REACT_APP_BASE_URL}${this.controler}/collection/download?id=${id}`
        window.open(url);
    }
}

export default CollectionAPI