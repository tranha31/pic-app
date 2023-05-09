using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class CopyrightImage
    {
        public string ImageID { get; set; }
        public string UserPublicKey { get; set; }
        public string Caption { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int? Status { get; set; } = 0;
    }
}
