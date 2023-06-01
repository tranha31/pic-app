import init from "./init";

class CopyrightAPI {
    constructor() {
        this.controler = "Gateway";

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
     * Từ chối yêu cầu
     * @param {*} param 
     * @returns 
     */
    async rejectRequest(param){
        try{
            var res = await init.delete(`${this.controler}/request/appeal/reject`, {params: param})
            return res;
        }
        catch(err){
            return(err)
        }
         
    }

    /**
     * Chấp nhận yêu cầu
     * @param {*} param 
     * @returns 
     */
    async acceptRequest(id, key){
        try{
            var res = await init.post(`${this.controler}/request/appeal/accept`, null, {params: {id, key}});
            return res;
        }
        catch(err){
            return err;
        }
    }
}

export default CopyrightAPI