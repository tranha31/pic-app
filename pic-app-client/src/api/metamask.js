const CONTRACT = require('./contractconfig');
const Web3 = require('web3');

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
    
    async connectSmartContract(){
        const ABI = CONTRACT.CONTRACT_ABI;
        const Address = CONTRACT.CONTRACT_ADDRESS;
        window.web3 = await new Web3(window.ethereum);
        window.contract = await new window.web3.eth.Contract(ABI, Address);
    }

    async createAuctionRoom(id, startTime, endTime, price, account){
        await window.contract.methods.createAuctionRoom(id, startTime, endTime, price).send({from: account});
    }

    async updateAuctionRoom(id, startTime, endTime, timeUpdate, price, account){
        await window.contract.methods.updateAuction(id, startTime, endTime, timeUpdate, price).send({from: account});
    }
    
    async addNewBid(id, excuteTime, account, amount){
        await window.contract.methods.bid(id, excuteTime).send({from: account, value: amount});
    }

    async withDraw(id, excuteTime, account){
        await window.contract.methods.withDraw(id, excuteTime).send({from: account});
    }

    async endAuction(id, excuteTime, account){
        await window.contract.methods.endAuction(id, excuteTime).send({from: account});
    }
}

export default Metamask;