using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.DL
{
    public class CopyrightDL: DLBase
    {
        public string MongoDBName = "picbin_repo";
        public string MongoCollection = "CopyrightImage";

        public CopyrightDL(IConfiguration configuration) : base(configuration)
        {
            SetMongoDB(MongoDBName);
        }

        public async Task AddNewImage(CopyrightImage image, string content, string imageMarked)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("Sign", image.UserPublicKey);
            parameters.Add("Caption", image.Caption);
            parameters.Add("ID", direction: ParameterDirection.Output);

            var procName = "Proc_AddNewImage";
            List<string> listOutPut = new List<string>() { "ID" };

            ExcuteProcMySQL(procName, parameters, ref listOutPut);

            var id = listOutPut[0];
            var guid = new Guid();
            if(!string.IsNullOrEmpty(id) && Guid.TryParse(id, out guid))
            {
                CopyrightImageModel copyrightImage = new CopyrightImageModel() { RefID = id, ImageContent = content, ImageContentMarked = imageMarked };
                await InsertOneAsync<CopyrightImageModel>(copyrightImage, MongoCollection);
            }
        }

        public async Task<List<RegisterRequestModel>> GetAllRegisterRequest(FilterDefinition<RegisterRequestModel> filter)
        {
            List<RegisterRequestModel> data = await GetAllDataAsync<RegisterRequestModel>(filter, "RegisterRequest");

            return data;
        }
    }
}
