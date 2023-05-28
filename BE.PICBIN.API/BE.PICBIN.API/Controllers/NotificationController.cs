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
    public class NotificationController : Controller
    {
        private readonly IConfiguration _config;

        public NotificationController(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Lay ds
        /// </summary>
        /// <param name="userKey"></param>
        /// <returns></returns>
        [HttpGet("")]
        public async Task<IActionResult> GetNotification(string userKey)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                NotificationBL oBL = new NotificationBL(_config);
                result = await oBL.GetNotification(userKey);

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
        /// Update seen
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        [HttpPost("")]
        public IActionResult UpdateSeen(string ids)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                NotificationBL oBL = new NotificationBL(_config);
                result.Success = true;
                oBL.UpdateSeenNotification(ids);

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
