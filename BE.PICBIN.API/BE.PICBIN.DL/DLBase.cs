using Dapper;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.DL
{
    public class DLBase
    {
        public string MySQLConnection { 
            get 
            {
                var config = Configuration.GetSection("ConnectionStrings");
                return config.GetSection("MySQLConnectionString").Value;
            }
        }

        public string MongoDBConnection { 
            get
            {
                var config = Configuration.GetSection("ConnectionStrings");
                return config.GetSection("MongoDBConnectionString").Value;
            }
        }

        public IDbConnection _dbConnection { get; set; }

        public MongoClient _mongoClient
        {
            get
            {
                return new MongoClient(MongoDBConnection);
            }
        }

        public IConfiguration Configuration { get; }

        public IMongoDatabase mongoDB { get; set; }

        public DLBase(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        #region MongoDB

        public void SetMongoDB(string databaseName)
        {
            mongoDB = _mongoClient.GetDatabase(databaseName);
        }

        public async Task InsertOneAsync<T>(T data, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            await collection.InsertOneAsync(data);
        }

        public async Task InsertManyAsync<T>(List<T> data, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            await collection.InsertManyAsync(data);
        }

        public async Task UpdateOneAsync<T>(FilterDefinition<T> filter, UpdateDefinition<T> update, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            await collection.UpdateOneAsync(filter, update);
        }

        public async Task DeleteOneAsync<T>(FilterDefinition<T> filter, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            await collection.DeleteOneAsync(filter);
        }

        public async Task DeleteManyAsync<T>(FilterDefinition<T> filter, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            await collection.DeleteManyAsync(filter);
        }

        public async Task<List<T>> GetDataAsync<T>(FilterDefinition<T> filter, string collectionName, int start, int length)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            var data = await collection.Find(filter).Skip(start).Limit(length).ToListAsync();

            return data;
        }

        public async Task<List<T>> GetAllDataAsync<T>(FilterDefinition<T> filter, string collectionName)
        {
            var collection = mongoDB.GetCollection<T>(collectionName);
            var data = await collection.Find(filter).ToListAsync();

            return data;
        }

        #endregion

        #region MySQL

        public bool ExcuteProcMySQL(string procName, DynamicParameters parameters, ref List<string> listOutput)
        {
            var result = true;
            _dbConnection = new MySqlConnection(MySQLConnection);
            _dbConnection.Open();
            using (var transaction = _dbConnection.BeginTransaction())
            {
                try
                {
                    _dbConnection.Execute(procName, parameters, commandType: CommandType.StoredProcedure, transaction: transaction);
                    
                    if(listOutput != null && listOutput.Count > 0)
                    {
                        List<string> lstTempOutput = new List<string>();
                        for (var i = 0; i < listOutput.Count; i++) { 
                            var output = parameters.Get<object>(listOutput[i]).ToString();
                            lstTempOutput.Add(output);
                        }

                        listOutput.Clear();
                        listOutput = lstTempOutput;
                    }

                    transaction.Commit();

                }
                catch (Exception e)
                {
                    result = false;
                    transaction.Rollback();
                }
                finally
                {
                    transaction.Dispose();
                    _dbConnection.Close();
                }
            }

            return result;
        }

        public bool ExcuteCommandMySQL(string sql, DynamicParameters parameters, ref List<string> listOutput)
        {
            var result = true;
            _dbConnection = new MySqlConnection(MySQLConnection);
            _dbConnection.Open();
            using (var transaction = _dbConnection.BeginTransaction())
            {
                try
                {
                    _dbConnection.Execute(sql, parameters, commandType: CommandType.Text, transaction: transaction);

                    if (listOutput != null && listOutput.Count > 0)
                    {
                        List<string> lstTempOutput = new List<string>();
                        for (var i = 0; i < listOutput.Count; i++)
                        {
                            var output = parameters.Get<object>(listOutput[i]).ToString();
                            lstTempOutput.Add(output);
                        }

                        listOutput.Clear();
                        listOutput = lstTempOutput;
                    }

                    transaction.Commit();

                }
                catch (Exception e)
                {
                    result = false;
                    transaction.Rollback();
                }
                finally
                {
                    transaction.Dispose();
                    _dbConnection.Close();
                }
            }
            return result;
        }

        public IEnumerable<T> QueryCommandMySQL<T>(string sql, DynamicParameters parameters, ref List<string> listOutput)
        {
            _dbConnection = new MySqlConnection(MySQLConnection);
            _dbConnection.Open();
            try
            {
                var data = _dbConnection.Query<T>(sql, parameters, commandType: CommandType.Text);

                if (listOutput != null && listOutput.Count > 0)
                {
                    List<string> lstTempOutput = new List<string>();
                    for (var i = 0; i < listOutput.Count; i++)
                    {
                        var output = parameters.Get<object>(listOutput[i]).ToString();
                        lstTempOutput.Add(output);
                    }

                    listOutput.Clear();
                    listOutput = lstTempOutput;
                }

                return data;

            }
            catch (Exception e)
            {
                return null;
            }
            finally
            {
                _dbConnection.Close();
            }
        }

        #endregion
    }
}
