class Metamask {

    async checkConnect(){
        if(window.ethereum){
            return true
        }
        else{
            return false
        }
    }

    async getAddress(){
        const res = await window.ethereum.request({method:'eth_requestAccounts'})
        sessionStorage.setItem("user_public_key", res);
        return res
    }
}

export default Metamask;