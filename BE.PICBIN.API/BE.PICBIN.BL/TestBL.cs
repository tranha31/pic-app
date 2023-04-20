﻿using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.BL
{
    public class TestBL
    {
        public IConfiguration Configuration { get; }

        public TestBL(IConfiguration configuration) {
            Configuration = configuration;
        }

        public async Task<object> TestConnectCopyrightManger()
        {
            var copyRightUrl = Configuration.GetSection("CopyrightManager").Value;
            var url = copyRightUrl + "/test";
            var result = await CallHTTPRequest.CallHttp(url, "GET");
            return result;
        }
    }
}