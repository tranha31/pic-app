using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class AuctionHistory
    {
        public string ID { get; set; }
        public string AuctionRoomID { get; set; }
        public string UserPublicKey { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedTime { get; set; }
        public int Action { get; set; }
    }
}
