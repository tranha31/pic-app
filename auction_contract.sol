pragma solidity >=0.8.7;

contract AuctonContract{

    struct AuctionRoom{
        string auctionID; //Id cua room
        uint startTime; //Thoi gian bat dau
        uint endTime; //Thoi gian ket thuc
        uint highestBid; //Gia cao nhat hien tai
        address highestBidder; //Nguoi dat gia cao nhat hien tai
        address owner; //Nguoi tao phong (nguoi thu huong)
    }

    struct AuctionBid{
        address user; //Nguoi dat cuoc
        uint amount; //So luong da dat
    }

    mapping(string => AuctionRoom) public auction_rooms;
    mapping(string => AuctionBid[]) public auction_bids;

    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);

    function getBalance() external view returns(uint){
        return address(this).balance;
    }

    function getContractAddress() external view returns(address){
        return address(this);
    }

    function getAuctionRoom(string memory auctionID) external view returns(AuctionRoom memory){
        AuctionRoom memory room = auction_rooms[auctionID];
        require(room.owner != address(0x0) , "Auction room is not exist");

        return room;
    }

    function getAuctionBid(string memory auctionID) external view returns(AuctionBid[] memory){
        AuctionBid[] memory user_bids = auction_bids[auctionID];
        require(user_bids.length > 0, "Auction room is not has bid");

        return user_bids;
    }

    /*
    * Tao phong dau gia
    */
    function createAuctionRoom(string memory id, uint start, uint end, uint price) public {
        AuctionRoom memory room_1 = auction_rooms[id];
        require(keccak256(bytes(room_1.auctionID)) != keccak256(bytes(id)), "Auction room is exist");
        require(start < end, "Time invalid");

        AuctionRoom memory room = AuctionRoom({
            auctionID: id,
            startTime: start,
            endTime: end,
            highestBid: price,
            highestBidder: address(0x0),
            owner: msg.sender
        });

        auction_rooms[id] = room;
    }

    /*
    * Cap nhat phong dau gia
    */
    function updateAuction(string memory auctionID, uint start, uint end, uint timeUpdate, uint price) public {
        AuctionRoom memory room = auction_rooms[auctionID];
        require(room.owner != address(0x0) , "Auction room is not exist");
        require(room.owner == msg.sender, "You are not owner");
        require(timeUpdate > 0 && timeUpdate < start && start < end);

        AuctionBid[] memory user_bids = auction_bids[auctionID];
        require(user_bids.length == 0, "Auction room has bid");
        
        auction_rooms[auctionID].startTime = start;
        auction_rooms[auctionID].endTime = end;
        auction_rooms[auctionID].highestBid = price;
    }

    /**
    * Tham gia dat cuoc
     */
    function bid(string memory auctionID, uint excuteTime) public payable{
        AuctionRoom memory room = auction_rooms[auctionID];
        require(room.owner != address(0x0) , "Auction room is not exist");
        require(room.owner != msg.sender , "You are owner");
        require(excuteTime >= room.startTime, "Auction is not started");
        require(excuteTime <= room.endTime, "Auction is ended");
        require(msg.sender.balance > msg.value, "You are not enough coin");

        AuctionBid[] memory user_bids = auction_bids[auctionID];
        if(user_bids.length > 0){
            int index = -1;
            for(uint i = 0; i < user_bids.length; i++){
                if(user_bids[i].user == msg.sender){
                    index = int(i);
                    break;
                }
            }

            if(index > -1){
                uint ind = uint(index);
                AuctionBid memory user_bid = user_bids[ind];
                if(user_bid.amount + msg.value <= room.highestBid){
                    revert("Price must be greater than highest price");
                }

                auction_rooms[auctionID].highestBid = user_bids[ind].amount + msg.value;
                auction_rooms[auctionID].highestBidder = msg.sender;
                auction_bids[auctionID][ind].amount += msg.value;

                emit Deposited(msg.sender, msg.value);
            }
            else{
                if(msg.value <= room.highestBid){
                    revert("Price must be greater than highest price");
                }

                auction_rooms[auctionID].highestBid = msg.value;
                auction_rooms[auctionID].highestBidder = msg.sender;

                auction_bids[auctionID].push(AuctionBid({
                    user: msg.sender,
                    amount: msg.value
                }));

                emit Deposited(msg.sender, msg.value);
            }
        }
        else{
            if(msg.value <= room.highestBid){
                revert("Price must be greater than highest price");
            }
            
            auction_rooms[auctionID].highestBid = msg.value;
            auction_rooms[auctionID].highestBidder = msg.sender;

            auction_bids[auctionID].push(AuctionBid({
                user: msg.sender,
                amount: msg.value
            }));

            emit Deposited(msg.sender, msg.value);
        }
    }

    /**
    * Rut tien
     */
    function withDraw(string memory auctionID, uint excuteTime) external{
        AuctionRoom memory room = auction_rooms[auctionID];
        require(room.owner != address(0x0) , "Auction room is not exist");
        require(room.owner != msg.sender,"You are the owner of the room");
        require(room.highestBidder != msg.sender, "You are the highest.");
        require(excuteTime >= room.startTime, "Invalid time.");
        AuctionBid[] memory user_bids = auction_bids[auctionID];

        if(user_bids.length == 0){
            revert("Auction room is not has bid");
        }

        int index = -1;
        for(uint i = 0; i < user_bids.length; i++){
            if(user_bids[i].user == msg.sender){
                index = int(i);
                break;
            }
        }

        if(index == -1){
            revert("You are not joined room");
        }
        uint ind = uint(index);
        payable(msg.sender).transfer(user_bids[ind].amount);
        emit Withdrawn(msg.sender, user_bids[ind].amount);
        delete auction_bids[auctionID][ind];
    }

    /**
    * Xu ly ket thuc dau gia
     */
    function endAuction(string memory auctionID, uint excuteTime) external{
        AuctionRoom memory room = auction_rooms[auctionID];
        require(room.owner != address(0x0) , "Auction room is not exist");
        require(excuteTime > room.endTime, "Auction is not ended");

        if(room.highestBidder == address(0x0)){
            delete auction_rooms[auctionID];
        }
        else{
            AuctionBid[] memory user_bids = auction_bids[auctionID];
            for(uint i = 0; i < user_bids.length; i++){
                if(user_bids[i].user == room.highestBidder){
                    continue;
                }
                payable(user_bids[i].user).transfer(user_bids[i].amount);
                emit Withdrawn(user_bids[i].user, user_bids[i].amount);
            }
            payable(room.owner).transfer(room.highestBid);
            emit Withdrawn(room.owner, room.highestBid);

            delete auction_bids[auctionID];
            delete auction_rooms[auctionID];
        }

        
    }
}