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
    public class TradeController : Controller
    {
        private readonly IConfiguration _config;

        public TradeController(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Đăng bán ảnh
        /// </summary>
        /// <param name="key"></param>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="detail"></param>
        /// <param name="price"></param>
        /// <returns></returns>
        [HttpPost("update/sell")]
        public IActionResult UpdateSellImage(int mode, string itemID, string key, string id, string name, string detail, decimal price)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                TradeBL oBL = new TradeBL(_config);
                result = oBL.AddNewSellImage(mode, itemID, key, id, name, detail, price);

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
        /// Lấy ds ảnh đang được bán
        /// </summary>
        /// <param name="key"></param>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <returns></returns>
        [HttpGet("sell/paging")]
        public async Task<IActionResult> GetListSellPaging(string key, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                TradeBL oBL = new TradeBL(_config);
                result = await oBL.GetListSellPaging(key, start, length, fromDate, toDate);

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
        /// Xoá ảnh đang bán
        /// </summary>
        /// <returns></returns>
        [HttpDelete("sell/delete")]
        public IActionResult HandleDeleteSell(string id)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                TradeBL oBL = new TradeBL(_config);
                var check = oBL.HandleDeleteSell(id);
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
        /// Lấy ds ảnh đang được bán
        /// </summary>
        /// <param name="key"></param>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <returns></returns>
        [HttpGet("home/sell/paging")]
        public async Task<IActionResult> GetListSellPagingForHome(string key, string searchKey, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                TradeBL oBL = new TradeBL(_config);
                result = await oBL.GetListSellPagingForHome(key, searchKey, start, length, fromDate, toDate);

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
        /// Lấy thông tin của ảnh đang bán
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("sell/getbyid")]
        public async Task<IActionResult> GetMarketItemByID(string id)
        {
            ServiceResult result = new ServiceResult();
            try
            {
                TradeBL oBL = new TradeBL(_config);
                result = await oBL.GetMarketItemByID(id);

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
