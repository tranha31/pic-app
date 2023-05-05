import init from "./init";

class CopyrightAPI {
    constructor() {
        this.controler = "Gateway";
    }

    
    /**
     * Từ chối yêu cầu
     * @param {*} param 
     * @returns 
     */
    async rejectRequest(param){
        return await init.delete(`${this.controler}/request/appeal/reject`, {params: param})
    }

    /**
     * Chấp nhận yêu cầu
     * @param {*} param 
     * @returns 
     */
    async acceptRequest(id, key){
        return await init.post(`${this.controler}/request/appeal/accept`, null, {params: {id, key}})
    }
}

export default CopyrightAPI