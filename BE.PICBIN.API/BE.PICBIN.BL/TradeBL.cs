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
        public CurrentDateTime current { get; set; }

        public TradeBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
            current = new CurrentDateTime(configuration);
        }

        #region Sell

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

            if (mode == 0 && image.Status != 0)
            {
                serviceResult.Error = "Image invalid";
                return serviceResult;
            }

            try
            {
                TradeDL tradeDL = new TradeDL(Configuration);
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
        public async Task<ServiceResult> GetListSellPaging(string key, string searchKey, int start, int length, DateTime fromDate, DateTime toDate)
        {
            TradeDL dL = new TradeDL(Configuration);
            var data = dL.GetListSellPaging(key, searchKey, start, length, 0, fromDate, toDate);

            ServiceResult serviceResult = await HandleGetImageMarketContent(data);
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

        public async Task<ServiceResult> GetListSellPagingForHome(string searchKey, int start, int length, int typeOrder)
        {
            TradeDL dL = new TradeDL(Configuration);
            var data = dL.GetListSellPaging(null, searchKey, start, length, mode: 1, typeOrder: typeOrder);

            ServiceResult serviceResult = await HandleGetImageMarketContent(data);

            return serviceResult;
        }

        public async Task<ServiceResult> HandleGetImageMarketContent(List<MarketItem> data)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
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
                for (var i = 0; i < imageContent.Count; i++)
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
            if (string.IsNullOrEmpty(id))
            {
                return false;
            }

            TradeDL oDL = new TradeDL(Configuration);
            return oDL.HandleDeleteSell(id);
        }

        #endregion

        #region Auction

        public async Task<ServiceResult> GetListAuctionRoomPaging(string key, int start, int length, DateTime fromDate, DateTime toDate)
        {
            TradeDL dL = new TradeDL(Configuration);
            var data = dL.GetListAuctionRoomPaging(key, start, length, fromDate, toDate, 0);

            ServiceResult serviceResult = await HandleGetImageAuctionContent(data);
            return serviceResult;
        }

        public bool HandleDeleteAuctionRoom(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return false;
            }

            TradeDL oDL = new TradeDL(Configuration);
            List<AuctionHistory> auctionDetails = oDL.GetAuctionRoomDetail(id);
            if (auctionDetails != null && auctionDetails.Count > 0)
            {
                return false;
            }

            AuctionRoom auctionRoom = oDL.GetAuctionRoomByID(id);
            if(auctionRoom == null)
            {
                return false;
            }

            if(auctionRoom.StartTime <= current.GetCurrentDateTime())
            {
                return false;
            }

            return oDL.HandleDeleteAuctionRoom(id);
        }

        private async Task<ServiceResult> HandleGetImageAuctionContent(List<AuctionRoom> data)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
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
                for (var i = 0; i < imageContent.Count; i++)
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
        /// Lay lich su dat cuoc
        /// </summary>
        /// <param name="roomID"></param>
        /// <returns></returns>
        public List<AuctionHistory> GetAuctionRoomHistory(string roomID)
        {
            TradeDL oDL = new TradeDL(Configuration);
            return oDL.GetAuctionRoomDetail(roomID);

        }

        /// <summary>
        /// Them moi lich su dat cuoc
        /// </summary>
        /// <param name="roomID"></param>
        /// <param name="key"></param>
        /// <param name="price"></param>
        /// <param name="action"></param>
        /// <returns></returns>
        public ServiceResult AddAuctionHistory(string roomID, string key, decimal price, int action)
        {
            ServiceResult serviceResult = new ServiceResult();
            TradeDL oDL = new TradeDL(Configuration);
            
            var auctionRoom = oDL.GetAuctionRoomByID(roomID);
            if(auctionRoom == null)
            {
                serviceResult.Error = "Auction room is not exist";
                return serviceResult;
            }

            if(key == auctionRoom.OwnerPublicKey)
            {
                serviceResult.Error = "You are owner";
                return serviceResult;
            }

            if(current.GetCurrentDateTime() < auctionRoom.StartTime || current.GetCurrentDateTime() > auctionRoom.EndTime)
            {
                serviceResult.Error = "Invalid time";
                return serviceResult;
            }

            serviceResult.Success = oDL.AddAuctionHistory(roomID, key, price, action);
            return serviceResult;
        }

        /// <summary>
        /// Lay ds phong dang tham gia
        /// </summary>
        /// <param name="key"></param>
        /// <param name="status"></param>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetListJoinAuctionRoomPaging(string key, int status, int start, int length)
        {
            TradeDL oDL = new TradeDL(Configuration);
            List<AuctionRoom> data = oDL.GetListJoinAuctionRoomPaging(key, status, start, length);

            ServiceResult serviceResult = await HandleGetImageAuctionContent(data);
            return serviceResult;
        }

        public async Task<ServiceResult> GetAuctionRoomByID(string id)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                TradeDL dL = new TradeDL(Configuration);
                var data = dL.GetAuctionRoomByID(id);

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

        public async Task<ServiceResult> GetListAuctionRoomForHomePaging(int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            TradeDL dL = new TradeDL(Configuration);
            var data = dL.GetListAuctionRoomPaging(null, start, length, fromDate, toDate, 1, status);

            ServiceResult serviceResult = await HandleGetImageAuctionContent(data);
            return serviceResult;
        }

        public ServiceResult UpdateAuctionRoom(int mode, string key, string itemID, string imageID, DateTime fromDate, DateTime toDate, decimal startPrice)
        {
            ServiceResult serviceResult = new ServiceResult() { Success = false };
            CollectionDL oDL = new CollectionDL(Configuration);
            CopyrightImage image = oDL.GetCopyrightImage(imageID);
            if (image == null || image.UserPublicKey != key)
            {
                return serviceResult;
            }

            if (mode == 0 && image.Status != 0)
            {
                serviceResult.Error = "Image invalid";
                return serviceResult;
            }

            try
            {
                TradeDL tradeDL = new TradeDL(Configuration);

                var now = current.GetCurrentDateTime();

                if(fromDate < now || toDate < now || fromDate >= toDate)
                {
                    serviceResult.Error = "Image time";
                    return serviceResult;
                }
                
                if(mode == 1)
                {
                    List<AuctionHistory> auctionDetails = tradeDL.GetAuctionRoomDetail(itemID);
                    if(auctionDetails != null && auctionDetails.Count > 0)
                    {
                        serviceResult.Error = "Exist detail";
                        return serviceResult;
                    }
                }

                tradeDL.UpdateAuctionRoom(mode, itemID, key, imageID, fromDate, toDate, startPrice);
                serviceResult.Success = true;
            }
            catch (Exception ex)
            {
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;
        }

        #endregion

    }
}
