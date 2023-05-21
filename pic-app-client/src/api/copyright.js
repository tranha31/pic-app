import init from "./init";

class CopyrightAPI {
    constructor() {
        this.controler = "Gateway";
    }

    /**
     * Kiểm tra chữ ký trong ảnh
     * @param {string} body : content image
     * @returns 
     */
    async checkCopyright(body){
        return await init.post(`${this.controler}/copyright/check`, body);
    }

    /**
     * Thêm mới yêu cầu đăng ký bảng quyền
     * @param {*} body: content request 
     */
    async addNewRegisterRequest(body){
        return await init.post(`${this.controler}/register/add`, body);
    }

    /**
     * Xoá các request bị từ chối
     * @param {*} param 
     * @returns 
     */
    async deleteRequestReject(param){
        return await init.delete(`${this.controler}/register/reject/delete`, {params: param})
    }

    /**
     * Gửi yêu cầu kháng cáo
     * @param {*} param 
     * @returns 
     */
    async sendAppealRequest(param){
        return await init.get(`${this.controler}/request/appeal/add`, {params: param})
    }

    async updateCopyright(oldKey, newKey, imageID, sellID){
        return await init.post(`${this.controler}/copyright/update`, null, {params: {oldKey, newKey, imageID, sellID}})
    }
}

export default CopyrightAPI