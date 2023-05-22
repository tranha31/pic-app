using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class AuctionRoom
    {
        public string ID { get; set; }
        public string ImageID { get; set; }
        public string OwnerPublicKey { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal HighestPrice { get; set; }
        public string HighestBeter { get; set; }
        public decimal StartPrice { get; set; }
        public int Status { get; set; }
    }
}
