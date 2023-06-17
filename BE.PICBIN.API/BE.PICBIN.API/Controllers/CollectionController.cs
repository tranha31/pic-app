using BE.PICBIN.API.Authentication;
using BE.PICBIN.BL;
using BE.PICBIN.BL.Enities;
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

        /// <summary>
        /// Upload register request
        /// </summary>
        /// <returns></returns>
        [HttpGet("appeal/request/paging")]
        public async Task<IActionResult> AppealRegister(string key, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetRequestAppealPaging(key, start, length, fromDate, toDate);

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
        [Authorize]
        [HttpGet("appeal/request/all/paging")]
        public async Task<IActionResult> AppealAllRegister(int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetRequestAppealAllPaging(start, length, fromDate, toDate);

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
        /// Lấy ds người đã đk ảnh
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="search"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("user/paging")]
        public IActionResult GetListUserPaging(int start, int length, string search)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = oBL.GetListUserPaging(start, length, search);

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
        /// Lấy danh sách ảnh của user
        /// </summary>
        /// <returns></returns>
        [HttpGet("collection/paging")]
        public async Task<IActionResult> GetListImageUserPaging(string key, int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetListImageUserPaging(key, start, length, fromDate, toDate, status);

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
        /// Lấy danh sách ảnh của user
        /// </summary>
        /// <returns></returns>
        [HttpGet("collection/all/paging")]
        public async Task<IActionResult> GetListImageUserAllPaging(string key, int start, int length, int status)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                CollectionBL oBL = new CollectionBL(_config);
                result = await oBL.GetListImageUserAllPaging(key, start, length, status);

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
