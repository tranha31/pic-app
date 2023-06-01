import init from "./init";

class LoginAPI {
    constructor() {
        this.controler = "Login";
    }

    /**
     * Chấp nhận yêu cầuin
     * @param {*} param 
     * @returns 
     */
    async login(username, password){
        return await init.post(`${this.controler}/login`, null, {params: {username, password}})
    }
}

export default LoginAPI