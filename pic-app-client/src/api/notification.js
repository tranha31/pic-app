import init from "./init";

class NotificationAPI {
    constructor() {
        this.controler = "Notification";
    }
    async getListNotification(param){
        return await init.get(`${this.controler}`, {params: param})
    }

    async updateSeenNotifi(ids){
        return await init.post(`${this.controler}`, null, {params: {ids}})
    }
}

export default NotificationAPI