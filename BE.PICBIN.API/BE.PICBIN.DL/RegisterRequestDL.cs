using BE.PICBIN.DL.Entities;
using Dapper;
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

        public async Task HandleRejectRegisterRequest(string id, RegisterReject registerReject)
        {
            var filter = Builders<RegisterRequestModel>.Filter.Eq(s => s.RefID, id);
            var update = Builders<RegisterRequestModel>.Update.Set(s => s.Status, 2);

            await UpdateOneAsync<RegisterRequestModel>(filter, update, MongoCollection);

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("RefID", registerReject.RefID);
            parameters.Add("ImageID", registerReject.ImageSimilar);
            parameters.Add("Reason", registerReject.ReasonReject);

            var procName = "Proc_AddNew_RequestReject";
            List<string> listOutPut = null;

            ExcuteProcMySQL(procName, parameters, ref listOutPut);
        }

        public async Task HandleDeleteRegisterRequest(string id)
        {
            var filter = Builders<RegisterRequestModel>.Filter.Eq(s => s.RefID, id);
            await DeleteOneAsync<RegisterRequestModel>(filter, MongoCollection);

        }

        public async Task HandleDeleteRejectRegister(List<string> id)
        {

            DynamicParameters parameters = new DynamicParameters();
            for (var i = 0; i < id.Count; i++)
            {
                parameters.Add($"@Id{i}", id[i].Trim());
            }

            var sql = "";

            var s = new StringBuilder();
            s.Append("Delete From RegisterReject r Where r.RefID IN (");

            for(var i=0; i<id.Count; i++)
            {
                if (i == id.Count - 1)
                {
                    s.Append($"@Id{i}); ");
                }
                else
                {
                    s.Append($"@Id{i}, ");
                }
            }

            sql = s.ToString();
            s.Clear();

            List<string> listOutPut = null;

            var result = ExcuteCommandMySQL(sql, parameters, ref listOutPut);
            if (result)
            {
                var filter = Builders<RegisterRequestModel>.Filter.In(s => s.RefID, id);
                await DeleteManyAsync<RegisterRequestModel>(filter, MongoCollection);
            }
        }
    }
}
