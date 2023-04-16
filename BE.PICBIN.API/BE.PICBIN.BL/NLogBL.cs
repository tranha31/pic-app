using BE.PICBIN.DL;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.BL
{
    public class NLogBL
    {
        public IConfiguration Configuration { get; }

        public NLogBL(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void InsertLog(string message, string stackTrace)
        {
            NLog nLog = new NLog(Configuration);
            nLog.InsertLog(message, stackTrace);
        }
    }
}
