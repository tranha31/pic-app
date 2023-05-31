using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.BL
{
    public class LoginBL
    {
        public IConfiguration Configuration { get; }
        public NLog _nLog { get; set; }

        public LoginBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
        }

        /// <summary>
        /// Login admin
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public Admin Login(string username, string password)
        {
            Admin admin = null;
            try
            {
                LoginDL oDL = new LoginDL(Configuration);
                admin = oDL.Login(username, password);
            }
            catch (Exception ex)
            {
                _nLog.InsertLog(ex.Message, ex.StackTrace);
            }

            return admin;
        } 
    }
}
