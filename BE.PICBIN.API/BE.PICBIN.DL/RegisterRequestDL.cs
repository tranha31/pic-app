using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.DL
{
    public class RegisterRequestDL: DLBase
    {
        public string MongoDBName = "picbin_repo";
        public string MongoCollection = "RegisterRequest";

        public RegisterRequestDL(IConfiguration configuration) : base(configuration)
        {
            SetMongoDB(MongoDBName);
        }

        public async void HandleInsertNewRegister(RegisterRequestModel data)
        {
            await InsertOneAsync<RegisterRequestModel>(data, MongoCollection);
        }

        public async Task HandleRejectRegisterRequest(string id)
        {
            var filter = Builders<RegisterRequestModel>.Filter.Eq(s => s.RefID, id);
            var update = Builders<RegisterRequestModel>.Update.Set(s => s.Status, 2);

            await UpdateOneAsync<RegisterRequestModel>(filter, update, MongoCollection);

        }

        public async Task HandleDeleteRegisterRequest(string id)
        {
            var filter = Builders<RegisterRequestModel>.Filter.Eq(s => s.RefID, id);
            await DeleteOneAsync<RegisterRequestModel>(filter, MongoCollection);

        }
    }
}
