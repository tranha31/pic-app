class Metamask {

    async checkConnect(){
        if(window.ethereum){
            return true
        }
        else{
            return false
        }
    }

    async checkAcceptNetwork(){
        if(process.env.REACT_ACCEPT_TEST === "0" && window.ethereum.networkVersion != "1"){
            return false;
        }

        return true
    }

    async getAddress(){
        const res = await window.ethereum.request({method:'eth_requestAccounts'})
        sessionStorage.setItem("user_public_key", res);
        return res
    }

    async getAccountBalance(account){
        const balance = await window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
        return balance;
    }

    async sendTransation(transaction){
        var result = false;
        try{
            var txhash = await window.ethereum.request({method:'eth_sendTransaction', params: [transaction]})

            let checkTransactionConfirm = async (txhash) =>{
                let checkTransactionLoop = async () => {
                    var check = await window.ethereum.request({method: 'eth_getTransactionReceipt', params: [txhash]})
                    if(check != null){
                        return true;
                    }
                    else{
                        return await checkTransactionLoop();
                    }
                }
        
                return await checkTransactionLoop();
            }

            var done = await checkTransactionConfirm(txhash);
            result = done;
        }
        catch(err){
            console.log(err);
        }

        return result;
    }
    
}

export default Metamask;