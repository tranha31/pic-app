using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class PagingData
    {
        public object Data { get; set; }
        public int TotalPage { get; set; }
        public int TotalRecord { get; set; }
    }
}
