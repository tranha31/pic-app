using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class Notification
    {
        public string ID { get; set; }
        public string UserPublicKey { get; set; }
        public string Content { get; set; }
        public int Status { get; set; }
        public int Type { get; set; }
        public string ReferenceLink { get; set; }
        public DateTime CreatedTime { get; set; }
        public string ImageID { get; set; }
    }
}
