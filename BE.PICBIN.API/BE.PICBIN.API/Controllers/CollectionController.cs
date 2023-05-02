using BE.PICBIN.BL;
using BE.PICBIN.BL.Enities;
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
    public class CollectionController : Controller
    {
        private readonly IConfiguration _config;

        public CollectionController(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Upload register request
        /// </summary>
        /// <returns></returns>
        [HttpGet("register/request/paging")]
        public async Task<IActionResult> CopyrightRegister(string key, int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetRequestRegisterPaging(key, start, length, fromDate, toDate, status);

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
        /// Lấy các ảnh tương đồng
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("image/similar")]
        public async Task<IActionResult> GetImageSimilar(string id)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetImageSimilar(id);

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
