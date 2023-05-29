using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BE.PICBIN.BL
{
    public class NotificationBL
    {
        public IConfiguration Configuration { get; }
        public NLog _nLog { get; set; }

        public NotificationBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
        }

        /// <summary>
        /// Them moi thong bao
        /// </summary>
        /// <param name="noti"></param>
        public void AddNewNotification(Notification noti)
        {
            NotificationDL oDL = new NotificationDL(Configuration);
            oDL.AddNewNotification(noti);
        }

        /// <summary>
        /// Lay ds thong bao
        /// </summary>
        /// <param name="userKey"></param>
        /// <returns></returns>
        public async Task<ServiceResult> GetNotification(string userKey)
        {
            ServiceResult serviceResult = new ServiceResult();
            NotificationDL oDL = new NotificationDL(Configuration);
            List<Notification> data = oDL.GetNotification(userKey);
            if (data == null || data.Count == 0)
            {
                serviceResult.Success = true;
                return serviceResult;
            }

            //Thông báo nào có ảnh thì cần lấy thêm ảnh
            List<string> ids = new List<string>();
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.ImageID))
                {
                    ids.Add(item.ImageID);
                }
                
            }

            //Nếu không có thông báo nào có ảnh thì trả về kq luôn
            if(ids.Count == 0)
            {
                List<object> resultData = new List<object>();
                foreach (var item in data)
                {
                    var value = new
                    {
                        Infor = item
                    };
                    resultData.Add(value);
                }

                serviceResult.Success = true;
                serviceResult.Data = resultData;

                return serviceResult;
            }

            CollectionDL oDL2 = new CollectionDL(Configuration);
            var imageContent = await oDL2.GetImageCheckContent(ids);
            //Nếu ảnh không tồn tại thì là lỗi
            if (imageContent == null || imageContent.Count == 0)
            {
                serviceResult.Success = true;
                return serviceResult;
            }

            //Mapping data
            Dictionary<string, object> listData = new Dictionary<string, object>();
            Dictionary<string, object> listImage = new Dictionary<string, object>();
            for (var i = 0; i < data.Count; i++)
            {
                if (!string.IsNullOrEmpty(data[i].ImageID))
                {
                    listData.Add(data[i].ImageID, data[i]);
                    listImage.Add(imageContent[i].RefID, imageContent[i].ImageContentMarked);
                }
                else
                {
                    listData.Add(data[i].ID, data[i]);
                }
            }

            //Tao kq tra ve
            List<object> result = new List<object>();
            foreach (var item in data)
            {
                if (!string.IsNullOrEmpty(item.ImageID))
                {
                    var value = new
                    {
                        Infor = listData[item.ImageID],
                        Image = listImage[item.ImageID]
                    };
                    result.Add(value);
                }
                else
                {
                    var value = new
                    {
                        Infor = listData[item.ID]
                    };
                    result.Add(value);
                }
            }

            serviceResult.Success = true;
            serviceResult.Data = result;

            return serviceResult;
        }

        /// <summary>
        /// Cap nhat trang thai da xem
        /// </summary>
        /// <param name="listID"></param>
        public void UpdateSeenNotification(string listID)
        {
            NotificationDL oDL = new NotificationDL(Configuration);
            oDL.UpdateSeenNotification(listID);
        }

        /// <summary>
        /// Bắn thông báo cho người dùng
        /// </summary>
        public async Task PushMessage(Notificontent notificontent)
        {
            var pushURL = Configuration.GetSection("PushURL").Value;
            var url = pushURL + "/push/notification";
            await CallHTTPRequest.CallHttp(url, "POST", notificontent);
        }
    }
}
