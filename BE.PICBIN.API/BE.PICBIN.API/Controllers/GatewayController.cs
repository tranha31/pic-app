﻿using BE.PICBIN.BL;
using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GatewayController : Controller
    {
        private readonly IConfiguration _config;

        public GatewayController(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Upload register request
        /// </summary>
        /// <returns></returns>
        [HttpPost("register/add")]
        public IActionResult CopyrightRegister([FromBody] RegisterRequest registerRequest)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                oBL.HanleAddNewRegisterRequest(registerRequest.Sign, registerRequest.Image);
                result.Success = true;
                
            }
            catch(Exception ex)
            {
                result.Success = false;
                NLogBL nLog = new NLogBL(_config);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return Ok(result);
        }
    }
}