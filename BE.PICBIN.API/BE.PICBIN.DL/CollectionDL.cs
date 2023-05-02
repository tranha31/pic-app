using BE.PICBIN.DL.Entities;
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

        public CollectionDL(IConfiguration configuration) : base(configuration)
        {
            SetMongoDB(MongoDBName);
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
    }
}
