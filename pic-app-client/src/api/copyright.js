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
}

export default CopyrightAPI