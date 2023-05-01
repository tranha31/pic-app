using BE.PICBIN.BL;
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
                oBL.HandleAddNewRegisterRequest(registerRequest.Sign, registerRequest.Image);
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

        /// <summary>
        /// Xoá yêu cầu bị từ chối
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("register/reject/delete")]
        public async Task<IActionResult> DeleteRejectRegister(string id)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                var check = await oBL.HandleDeleteRejectRegister(id);
                result.Success = check;

            }
            catch (Exception ex)
            {
                result.Success = false;
                NLogBL nLog = new NLogBL(_config);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return Ok(result);
        }

        /// <summary>
        /// Upload register request
        /// </summary>
        /// <returns></returns>
        [HttpPost("copyright/check")]
        public async Task<IActionResult> CopyrightCheck([FromBody] CheckRequest image)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                result = await oBL.HandlCheckCopyright(image.Image);

            }
            catch (Exception ex)
            {
                result.Success = false;
                NLogBL nLog = new NLogBL(_config);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return Ok(result);
        }
    }
}
