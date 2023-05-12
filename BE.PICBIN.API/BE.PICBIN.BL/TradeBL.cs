using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.BL
{
    public class TradeBL
    {
        public IConfiguration Configuration { get; }
        public NLog _nLog { get; set; }

        public TradeBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
        }

        /// <summary>
        /// Thêm mới ảnh đăng bán
        /// </summary>
        /// <param name="key"></param>
        /// <param name="id"></param>
        /// <param name="name"></param>
        /// <param name="detail"></param>
        /// <param name="price"></param>
        /// <returns></returns>
        public ServiceResult AddNewSellImage(int mode, string itemID, string key, string id, string name, string detail, decimal price)
        {
            ServiceResult serviceResult = new ServiceResult() { Success = false };
            CollectionDL oDL = new CollectionDL(Configuration);
            CopyrightImage image = oDL.GetCopyrightImage(id);
            if (image == null || image.UserPublicKey != key)
            {
                return serviceResult;
            }

            if (image.Status != 0)
            {
                serviceResult.Error = "Image invalid";
                return serviceResult;
            }

            try
            {
                TradeDL tradeDL = new TradeDL(Configuration);
                if(mode == 0)
                {
                    itemID = Guid.NewGuid().ToString();
                }
                tradeDL.AddNewSellImage(mode, itemID, key, id, name, detail, price);
                serviceResult.Success = true;
            }
            catch (Exception ex)
            {
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;
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
        public async Task<ServiceResult> GetListSellPaging(string key, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                TradeDL dL = new TradeDL(Configuration);
                var data = dL.GetListSellPaging(key, start, length, fromDate, toDate);

                if (data == null || data.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                List<string> ids = new List<string>();
                foreach (var item in data)
                {
                    ids.Add(item.ImageID);
                }

                CollectionDL oDL = new CollectionDL(Configuration);
                var imageContent = await oDL.GetImageCheckContent(ids);
                if (imageContent == null || imageContent.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                Dictionary<string, object> listData = new Dictionary<string, object>();
                Dictionary<string, object> listImage = new Dictionary<string, object>();
                for (var i = 0; i < data.Count; i++)
                {
                    listData.Add(data[i].ImageID, data[i]);
                    listImage.Add(imageContent[i].RefID, imageContent[i].ImageContentMarked);
                }

                List<object> result = new List<object>();
                foreach (var item in data)
                {
                    var value = new
                    {
                        Infor = listData[item.ImageID],
                        Image = listImage[item.ImageID]
                    };

                    result.Add(value);
                }

                serviceResult.Success = true;
                serviceResult.Data = result;
                return serviceResult;
            }
            catch (Exception ex)
            {
                serviceResult.Success = false;
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;

        }

        /// <summary>
        /// Lấy thông tin ảnh đang được bán
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetMarketItemByID(string id)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                TradeDL dL = new TradeDL(Configuration);
                var data = dL.GetMarketItemByID(id);

                if (data == null)
                {
                    serviceResult.Success = false;
                    return serviceResult;
                }

                List<string> ids = new List<string>() { data.ImageID };

                CollectionDL oDL = new CollectionDL(Configuration);
                var imageContent = await oDL.GetImageCheckContent(ids);
                if (imageContent == null || imageContent.Count == 0)
                {
                    serviceResult.Success = false;
                    return serviceResult;
                }

                var value = new
                {
                    Infor = data,
                    Image = imageContent[0].ImageContentMarked
                };

                serviceResult.Success = true;
                serviceResult.Data = value;
                return serviceResult;
            }
            catch (Exception ex)
            {
                serviceResult.Success = false;
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;
        }

        public async Task<ServiceResult> GetListSellPagingForHome(string key, string searchKey, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                TradeDL dL = new TradeDL(Configuration);
                var data = dL.GetListSellPagingForHome(key, searchKey, start, length, fromDate, toDate);

                if (data == null || data.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                List<string> ids = new List<string>();
                foreach (var item in data)
                {
                    ids.Add(item.ImageID);
                }

                CollectionDL oDL = new CollectionDL(Configuration);
                var imageContent = await oDL.GetImageCheckContent(ids);
                if (imageContent == null || imageContent.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                Dictionary<string, object> listData = new Dictionary<string, object>();
                Dictionary<string, object> listImage = new Dictionary<string, object>();
                for (var i = 0; i < data.Count; i++)
                {
                    listData.Add(data[i].ImageID, data[i]);
                    listImage.Add(imageContent[i].RefID, imageContent[i].ImageContentMarked);
                }

                List<object> result = new List<object>();
                foreach (var item in data)
                {
                    var value = new
                    {
                        Infor = listData[item.ImageID],
                        Image = listImage[item.ImageID]
                    };

                    result.Add(value);
                }

                serviceResult.Success = true;
                serviceResult.Data = result;
                return serviceResult;
            }
            catch (Exception ex)
            {
                serviceResult.Success = false;
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;
        }

        /// <summary>
        /// Xử lý xoá bỏ ảnh đang bán
        /// </summary>
        /// <param name="id"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public bool HandleDeleteSell(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return false;
            }

            TradeDL oDL = new TradeDL(Configuration);
            return oDL.HandleDeleteSell(id);
        }
    }
}
