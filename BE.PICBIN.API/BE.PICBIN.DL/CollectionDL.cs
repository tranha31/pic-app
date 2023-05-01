using BE.PICBIN.DL.Entities;
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
    }
}
