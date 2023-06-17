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
    public class DownloadController : Controller
    {

        private readonly IConfiguration _config;

        public DownloadController(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Download Image
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("collection")]
        public async Task<IActionResult> DownloadImage(string id)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                var data = await oBL.GetImageDownload(id);
                var contentType = "image/png";
                var fileName = "Image_" + DateTime.Now.Ticks.ToString() + ".png";
                return File(data, contentType, fileName);

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
