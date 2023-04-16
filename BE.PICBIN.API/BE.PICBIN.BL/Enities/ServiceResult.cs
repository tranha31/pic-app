using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.BL.Enities
{
    public class ServiceResult
    {
        public bool Success { get; set; }
        public object Data { get; set; }
        public string Error { get; set; }
        public string Message { get; set; }
    }
}
