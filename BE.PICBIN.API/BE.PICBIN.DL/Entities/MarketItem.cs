using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class MarketItem
    {
        public string ID { get; set; }
        public string ImageID { get; set; }
        public string UserPublicKey { get; set; }
        public string Caption { get; set; }
        public string Detail { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
