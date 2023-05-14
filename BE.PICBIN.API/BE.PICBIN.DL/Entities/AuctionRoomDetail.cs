using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class AuctionRoomDetail
    {
        public string ID { get; set; }
        public string AuctionRoomID { get; set; }
        public string UserPublicKey { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime LastBetTime { get; set; }
    }
}
