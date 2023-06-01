import init from "./init";

class CollectionAPI {
    constructor() {
        this.controler = "Collection";

        var token = null;
        var nameEQ = "picapp=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' '){
                c = c.substring(1,c.length);
            } 
            if (c.indexOf(nameEQ) == 0) {
                token = c.substring(nameEQ.length,c.length);
                break;
            }
        }

        if(token){
            init.defaults.headers.common['Authorization'] = "Bearer " + token;
        }
    }
    
    /**
     * Lấy danh sách yêu cầu kháng cáo
     * @param {string} param : điều kiện lọc
     * @returns 
     */
    async getAllAppealRequestPaging(param){
        try{
            var res = await init.get(`${this.controler}/appeal/request/all/paging`, {params: param});
            return res;
        }
        catch(err){
            return err;
        }
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