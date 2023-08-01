﻿using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.BL
{
    public class CollectionBL
    {
        public IConfiguration Configuration { get; }
        public NLog _nLog { get; set; }
        public int diffHours { get; set; }

        public CollectionBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);

            var hours = configuration.GetSection("DifferenceHours").Value;
            diffHours = int.Parse(hours);
        }

        /// <summary>
        /// Lấy danh sách yêu cầu đăng ký bản quyền
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetRequestRegisterPaging(string key, int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            ServiceResult serviceResult = new ServiceResult();

            var fUser = Builders<RegisterRequestModel>.Filter.Eq(x => x.UserPublicKey, key);
            var fFromDate = Builders<RegisterRequestModel>.Filter.Gte<DateTime>(x => x.CreatedDate, fromDate);
            var fToDate = Builders<RegisterRequestModel>.Filter.Lte<DateTime>(x => x.CreatedDate, toDate);
            var fStatus = Builders<RegisterRequestModel>.Filter.Eq(x => x.Status, status);

            FilterDefinition<RegisterRequestModel> combineFilters;

            if(status == -1)
            {
                combineFilters = Builders<RegisterRequestModel>.Filter.And(fUser, fFromDate, fToDate);
            }
            else
            {
                combineFilters = Builders<RegisterRequestModel>.Filter.And(fUser, fFromDate, fToDate, fStatus);
            }

            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = await oDL.GetRegisterRequestPaging(combineFilters, start, length);
                serviceResult.Success = true;
                serviceResult.Data = data;
            }
            catch(Exception ex)
            {
                serviceResult.Success = false;
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;

        }

        /// <summary>
        /// Lấy danh sách ảnh tương đồng
        /// </summary>
        /// <param name="id">id của request</param>
        /// <returns></returns>
        public async Task<ServiceResult> GetImageSimilar(string id)
        {
            ServiceResult serviceResult = new ServiceResult();

            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = oDL.GetImageSimilarID(id);
                if(data != null && data.Count > 0)
                {
                    FilterDefinition<CopyrightImageModel> filter = Builders<CopyrightImageModel>.Filter.In(x => x.RefID, data);
                    var images = await oDL.GetAllImageSimilar(filter);
                    if(images != null && images.Count > 0)
                    {
                        List<string> contentImage = new List<string>();
                        foreach (var item in images)
                        {
                            contentImage.Add(item.ImageContentMarked);
                        }

                        serviceResult.Success = true;
                        serviceResult.Data = contentImage;
                    }
                }
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
        /// Lấy danh sách yêu cầu kháng cáo theo user
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetRequestAppealPaging(string key, int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult serviceResult = new ServiceResult();

            var fUser = Builders<AppealRegisterModel>.Filter.Eq(x => x.UserPublicKey, key);
            var fFromDate = Builders<AppealRegisterModel>.Filter.Gte<DateTime>(x => x.CreatedDate, fromDate);
            var fToDate = Builders<AppealRegisterModel>.Filter.Lte<DateTime>(x => x.CreatedDate, toDate);

            FilterDefinition<AppealRegisterModel> combineFilters;

            combineFilters = Builders<AppealRegisterModel>.Filter.And(fUser, fFromDate, fToDate);

            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = await oDL.GetAppealRequestPaging(combineFilters, start, length);
                serviceResult.Success = true;
                serviceResult.Data = data;
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
        /// Lấy danh sách yêu cầu kháng cáo của tất cả user
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetRequestAppealAllPaging(int start, int length, DateTime fromDate, DateTime toDate)
        {
            ServiceResult serviceResult = new ServiceResult();

            var fFromDate = Builders<AppealRegisterModel>.Filter.Gte<DateTime>(x => x.CreatedDate, fromDate);
            var fToDate = Builders<AppealRegisterModel>.Filter.Lte<DateTime>(x => x.CreatedDate, toDate);

            FilterDefinition<AppealRegisterModel> combineFilters;

            combineFilters = Builders<AppealRegisterModel>.Filter.And(fFromDate, fToDate);

            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = await oDL.GetAllAppealRequestPaging(combineFilters, start, length);
                serviceResult.Success = true;
                serviceResult.Data = data;
            }
            catch (Exception ex)
            {
                serviceResult.Success = false;
                NLogBL nLog = new NLogBL(Configuration);
                nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return serviceResult;

        }

        public async Task<ServiceResult> GetListImageUserAllPaging(string key, int start, int length, int status)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = oDL.GetListImageUserAllPaging(key, start, length, status);

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
                        Image = listImage.ContainsKey(item.ImageID) ? listImage[item.ImageID] : ""
                    };

                    result.Add(value);
                }

                serviceResult.Success = true;
                serviceResult.Data = result;
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
        /// Lấy danh sách user
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <returns></returns>
        public ServiceResult GetListUserPaging(int start, int length, string searchkey)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = oDL.GetListUserPaging(start, length, searchkey);
                serviceResult.Success = true;
                serviceResult.Data = data;
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
        /// Lấy ds ảnh của user
        /// </summary>
        /// <param name="start"></param>
        /// <param name="length"></param>
        /// <param name="fromDate"></param>
        /// <param name="toDate"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetListImageUserPaging(string key, int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            ServiceResult serviceResult = new ServiceResult();
            try
            {
                CollectionDL oDL = new CollectionDL(Configuration);
                var data = oDL.GetListImageUserPaging(key, start, length, fromDate, toDate, status);

                if(data == null || data.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                List<string> ids = new List<string>();
                foreach (var item in data)
                {
                    ids.Add(item.ImageID);
                }

                var imageContent = await oDL.GetImageCheckContent(ids);
                if(imageContent == null || imageContent.Count == 0)
                {
                    serviceResult.Success = true;
                    return serviceResult;
                }

                Dictionary<string, object> listData = new Dictionary<string, object>();
                Dictionary<string, object> listImage = new Dictionary<string, object>();
                for(var i=0; i< imageContent.Count; i++)
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
                        Image = listImage.ContainsKey(item.ImageID) ? listImage[item.ImageID] : ""
                    };

                    result.Add(value);
                }

                serviceResult.Success = true;
                serviceResult.Data = result;
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
        /// Lấy nội dung download
        /// </summary>
        /// <param name="key"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<byte[]> GetImageDownload(string id)
        {
            byte[] bytes = null;
            CollectionDL oDL = new CollectionDL(Configuration);
            var data = await oDL.GetImageContentByID(id);

            if(data != null)
            {
                data = data.Substring(22);
                bytes = Convert.FromBase64String(data);
            }

            return bytes;
        }

    }
}
