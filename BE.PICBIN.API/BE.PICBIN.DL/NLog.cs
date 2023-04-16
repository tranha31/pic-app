using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace BE.PICBIN.DL
{
    public class NLog
    {
        public string MySQLConnection { get; set; }

        public IConfiguration Configuration { get; }
        
        public NLog(IConfiguration configuration)
        {
            Configuration = configuration;
            var config = Configuration.GetSection("ConnectionStrings");
            MySQLConnection = config.GetSection("MySQLConnectionString").Value;
        }

        /// <summary>
        /// Lưu log vào mysql
        /// </summary>
        /// <param name="message"></param>
        /// <param name="stackTrace"></param>
        public void InsertLog(string message, string stackTrace)
        {
            DynamicParameters parameters = new DynamicParameters();
            Log log = new Log() { Message = message, StackTrace = stackTrace };
            parameters.AddDynamicParams(log);

            var _dbConnection = new MySqlConnection(MySQLConnection);
            _dbConnection.Open();
            using (var transaction = _dbConnection.BeginTransaction())
            {
                try
                {
                    _dbConnection.Execute("Proc_InsertLog", parameters, commandType: CommandType.StoredProcedure, transaction: transaction);
                    transaction.Commit();

                }
                catch (Exception e)
                {
                    transaction.Rollback();
                }
                finally
                {
                    transaction.Dispose();
                    _dbConnection.Close();
                }
            }
        }
    }
}
