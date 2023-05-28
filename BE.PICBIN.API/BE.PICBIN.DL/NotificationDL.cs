using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BE.PICBIN.DL
{
    public class NotificationDL : DLBase
    {
        public NotificationDL(IConfiguration configuration) : base(configuration)
        {

        }

        public void AddNewNotification(Notification noti)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@UserKey", noti.UserPublicKey);
            parameters.Add($"@Content", noti.Content);
            parameters.Add($"@Type", noti.Type);
            parameters.Add($"@ReferenceLink", noti.ReferenceLink);
            parameters.Add($"@ImageID", noti.ImageID);

            List<string> listOutPut = null;

            ExcuteProcMySQL("Proc_Notification_Insert", parameters, ref listOutPut);
        }

        public void UpdateSeenNotification(string listID)
        {
            List<string> ids = listID.Split(";").ToList();
            DynamicParameters parameters = new DynamicParameters();
            for (var i = 0; i < ids.Count; i++)
            {
                parameters.Add($"@Id{i}", ids[i].Trim());
            }

            var sql = "";

            var s = new StringBuilder();
            s.Append("UPDATE notification n SET n.Status = 1 WHERE n.ID IN(");

            for (var i = 0; i < ids.Count; i++)
            {
                if (i == ids.Count - 1)
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
            ExcuteCommandMySQL(sql, parameters, ref listOutPut);
        }

        public List<Notification> GetNotification(string userKey)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@UserKey", userKey);

            List<string> listOutPut = null;
            var result = QueryStoreMySQL<Notification>("Proc_Notification_Get", parameters, ref listOutPut);
            if (result != null)
            {
                var lstResult = new List<Notification>(result);
                return lstResult;
            }

            return null;
        }
    }
}
