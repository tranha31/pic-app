﻿using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.DL
{
    public class CollectionDL : DLBase
    {
        public string MongoDBName = "picbin_repo";
        public string registerRequestCollection = "RegisterRequest";
        public string appealRequestCollection = "AppealRequest";
        public int diffHours { get; set; }

        public CollectionDL(IConfiguration configuration) : base(configuration)
        {
            SetMongoDB(MongoDBName);

            var hours = configuration.GetSection("DifferenceHours").Value;
            diffHours = int.Parse(hours);
        }

        public async Task<List<RegisterRequestModel>> GetRegisterRequestPaging(FilterDefinition<RegisterRequestModel> filter, int start, int length)
        {
            List<RegisterRequestModel> data = await GetDataAsync<RegisterRequestModel>(filter, registerRequestCollection, start, length);

            data = data.OrderByDescending(x => x.CreatedDate).ToList();

            return data;
        }

        public List<string> GetImageSimilarID(string requestID)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Id", requestID);
            var sql = "Select r.ImageSimilar from registerreject r Where r.RefID = @Id";

            List<string> listOutPut = null;

            var result = QueryCommandMySQL<string>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                var lstResult = new List<string>(result);
                if (lstResult.Count > 0)
                {
                    List<string> data = lstResult[0].ToString().Split(";").ToList();
                    return data;
                }
            }

            return null;
        }

        public async Task<List<CopyrightImageModel>> GetAllImageSimilar(FilterDefinition<CopyrightImageModel> filter)
        {
            List<CopyrightImageModel> data = await GetAllDataAsync<CopyrightImageModel>(filter, "CopyrightImage");
            return data;
        }

        public async Task<List<AppealRegisterModel>> GetAppealRequestPaging(FilterDefinition<AppealRegisterModel> filter, int start, int length)
        {
            List<AppealRegisterModel> data = await GetDataAsync<AppealRegisterModel>(filter, appealRequestCollection, start, length);

            data = data.OrderByDescending(x => x.CreatedDate).ToList();

            return data;
        }
        
        public async Task<PagingData> GetAllAppealRequestPaging(FilterDefinition<AppealRegisterModel> filter, int start, int length)
        {
            List<AppealRegisterModel> data = await GetAllDataAsync<AppealRegisterModel>(filter, appealRequestCollection);

            data = data.OrderByDescending(x => x.CreatedDate).ToList();
            var totalRecord = data.Count;
            var totalPage = (int)Math.Ceiling(totalRecord / (float)length);
            data = data.Skip(start).Take(length).ToList();

            PagingData pagingData = new PagingData() { Data = data, TotalPage = totalPage, TotalRecord = totalRecord };
            
            return pagingData;
        }

        public PagingData GetListUserPaging(int start, int length, string searchKey)
        {
            PagingData pagingData = new PagingData();

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Start", start);
            parameters.Add($"@Length", length);
            if(searchKey == null)
            {
                searchKey = "";
            }
            parameters.Add($"@SearchKey", "%" + searchKey + "%");

            var sql = "SELECT * FROM copyrightsignature c WHERE LOWER(c.UserPublicKey) LIKE @SearchKey LIMIT @Start, @Length;";
            List<string> listOutPut = null;

            var result = QueryCommandMySQL<CopyrightSignature>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                var lstResult = new List<CopyrightSignature>(result);
                pagingData.Data = lstResult;
            }

            sql = "SELECT COUNT(c.RefID) FROM copyrightsignature c WHERE c.UserPublicKey LIKE @SearchKey;";
            var totalRecord = QueryCommandMySQL<int>(sql, parameters, ref listOutPut);
            if (totalRecord != null)
            {
                var lstResult = new List<int>(totalRecord);
                if(lstResult.Count > 0)
                {
                    pagingData.TotalRecord = lstResult[0];
                }
            }

            return pagingData;
        }

        public List<CopyrightImage> GetListImageUserPaging(string key, int start, int length, DateTime fromDate, DateTime toDate, int status)
        {
            List<CopyrightImage> lstResult;

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Start", start);
            parameters.Add($"@Length", length);
            parameters.Add($"@Key", key);
            parameters.Add($"@FromDate", fromDate.AddHours(diffHours));
            parameters.Add($"@ToDate", toDate.AddHours(diffHours));
            parameters.Add($"@Status", status);

            List<string> listOutPut = null;

            var result = QueryStoreMySQL<CopyrightImage>("Proc_ListImage_Paging", parameters, ref listOutPut);
            if (result != null)
            {
                lstResult = new List<CopyrightImage>(result);
                return lstResult;
            }

            return null;
        }

        public async Task<List<CopyrightImageModel>> GetImageCheckContent(List<string> ids)
        {
            FilterDefinition<CopyrightImageModel> filter = Builders<CopyrightImageModel>.Filter.In(x => x.RefID, ids);
            List<CopyrightImageModel> data = await GetAllDataAsync<CopyrightImageModel>(filter, "CopyrightImage");

            return data;
        }

        public async Task<string> GetImageContentByID(string id)
        {
            FilterDefinition<CopyrightImageModel> filter = Builders<CopyrightImageModel>.Filter.Eq(x => x.RefID, id);
            List<CopyrightImageModel> data = await GetAllDataAsync<CopyrightImageModel>(filter, "CopyrightImage");

            if(data != null && data.Count > 0)
            {
                return data[0].ImageContent;
            }

            return null;
        }

        public async Task UpdateContentImage(string id, string content)
        {
            var filter = Builders<CopyrightImageModel>.Filter.Eq(s => s.RefID, id);
            var update = Builders<CopyrightImageModel>.Update.Set(s => s.ImageContent, content);

            await UpdateOneAsync<CopyrightImageModel>(filter, update, "CopyrightImage");
        }

        public CopyrightImage GetCopyrightImage(string id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ID", id);

            var sql = "SELECT * FROM copyrightimage c WHERE c.ImageID = @ID";
            List<string> listOutPut = null;

            var result = QueryCommandMySQL<CopyrightImage>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                var lstResult = new List<CopyrightImage>(result);
                if(lstResult.Count > 0)
                {
                    CopyrightImage image = lstResult[0];
                    return image;
                }
            }

            return null;
        }

        public void AddNewSellImage(string key, string id, string name, string detail, float price)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("ImageID", id);
            parameters.Add("Key", key);
            parameters.Add("Caption", name);
            parameters.Add("Detail", detail);
            parameters.Add("Price", price);

            var procName = "Proc_MarketItem_Insert";
            List<string> listOutPut = null;

            ExcuteProcMySQL(procName, parameters, ref listOutPut);
        }

        public List<CopyrightImage> GetListImageUserAllPaging(string key, int start, int length, int status)
        {
            List<CopyrightImage> lstResult;

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Start", start);
            parameters.Add($"@Length", length);
            parameters.Add($"@Key", key);
            parameters.Add($"@Status", status);

            var sql = "SELECT * FROM copyrightimage c WHERE c.Status = @Status AND c.UserPublicKey = @Key ORDER BY c.CreatedDate DESC LIMIT @Start, @Length";

            List<string> listOutPut = null;
            

            var result = QueryCommandMySQL<CopyrightImage>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                lstResult = new List<CopyrightImage>(result);
                return lstResult;
            }

            return null;
        }
    }
}
