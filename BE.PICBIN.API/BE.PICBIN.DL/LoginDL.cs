using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BE.PICBIN.DL
{
    public class LoginDL : DLBase
    {
        public LoginDL(IConfiguration configuration) : base(configuration)
        {
        }

        public Admin Login(string username, string password)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Username", username);
            parameters.Add($"@Password", password);
            var sql = "SELECT * FROM admin a WHERE a.UserName = @Username AND a.Password = @Password;";

            List<string> listOutPut = null;

            var result = QueryCommandMySQL<Admin>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                var lstResult = new List<Admin>(result);
                if (lstResult.Count > 0)
                {
                    List<Admin> data = lstResult.ToList();
                    return data[0];
                }
            }

            return null;
        }
    }
}
