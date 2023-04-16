using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class CopyrightSignature
    {
        public string RefID { get; set; }
        public string UserPublicKey { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int NumberImage { get; set; }
    }
}
