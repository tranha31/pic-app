using BE.PICBIN.API.Authentication;
using BE.PICBIN.BL;
using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using Microsoft.AspNetCore.Authorization;
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
    [ApiKeyAuthFilter]
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
        [HttpDelete("register/reject/delete")]
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

        [HttpPost("register/move/queue")]
        public async Task<IActionResult> ManualPushRegisterToQueue()
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                await oBL.MoveRegisterToQueue();
                result.Success = true;

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
        /// Thêm mới yêu cầu kháng cáo
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("request/appeal/add")]
        public async Task<IActionResult> SendAppealRequest(string id)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                var check = await oBL.HandleAddAppealRequest(id);
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
        /// Từ chối yêu cầu
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("request/appeal/reject")]
        public async Task<IActionResult> RejectAppealRequest(string id, string userKey)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                var check = await oBL.HandleRejectAppealRequest(id, userKey);
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
        /// Chấp nhận yêu cầu
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("request/appeal/accept")]
        public async Task<IActionResult> AcceptAppealRequest(string id, string key)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                var check = await oBL.HandleAcceptAppealRequest(id, key);
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
        /// Thay đổi chữ ký trong ảnh
        /// </summary>
        /// <returns></returns>
        [HttpPost("copyright/update")]
        public async Task<IActionResult> UpdateCopyright(string oldKey, string newKey, string imageID, string sellID)
        {
            CopyrightBL oBL = new CopyrightBL(_config);
            ServiceResult result = new ServiceResult();
            try
            {
                result = await oBL.UpdateCopyright(oldKey, newKey, imageID, sellID);

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
        /// Xu ly ket thuc dau gia
        /// </summary>
        /// <param name="auctionID"></param>
        /// <returns></returns>
        [HttpPost("auction/room/finish")]
        public async Task<IActionResult> HandleFinishAuctionRoom(string auctionID)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CopyrightBL oBL = new CopyrightBL(_config);
                result = await oBL.HandleFinishAuctionRoom(auctionID);

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
