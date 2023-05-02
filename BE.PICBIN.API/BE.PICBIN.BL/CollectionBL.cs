using BE.PICBIN.BL.Enities;
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

        public CollectionBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
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
    }
}
