using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BE.PICBIN.BL
{
    public class CopyrightBL
    {
        public IConfiguration Configuration { get; }
        public NLog _nLog { get; set; }

        public CopyrightBL(IConfiguration configuration)
        {
            Configuration = configuration;
            _nLog = new NLog(configuration);
        }

        /// <summary>
        /// Xử lý đẩy yêu cầu vào queue
        /// </summary>
        /// <param name="content"></param>
        public void HandleAddNewRegisterRequest(string sign, string content)
        {
            var id = Guid.NewGuid().ToString();
            RegisterRequest registerRequest = new RegisterRequest() { ID = id, Sign = sign, Image = content };
            RegisterQueue registerQueue = new RegisterQueue(Configuration);
            registerQueue.PushObjectToQueue(registerRequest);

            Thread thread = new Thread(() =>
            {
                RegisterRequestModel model = new RegisterRequestModel()
                {
                    RefID = id,
                    UserPublicKey = sign,
                    ImageContent = content,
                    Status = 0,
                    CreatedDate = DateTime.Now
                };

                RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
                try
                {
                    oDL.HandleInsertNewRegister(model);
                }
                catch (Exception ex)
                {
                    _nLog.InsertLog(ex.Message, ex.StackTrace);
                }

            });

            thread.Start();
        }

        /// <summary>
        /// Lưu thông tin ảnh hợp lệ
        /// </summary>
        /// <param name="sign"></param>
        /// <param name="caption"></param>
        /// <param name="contentImage"></param>
        /// <returns></returns>
        public async Task AddNewCopyrightImage(string sign, string caption, string contentImage, string imageMarked)
        {
            var image = new CopyrightImage() { UserPublicKey = sign, Caption = caption };
            CopyrightDL oDL = new CopyrightDL(Configuration);
            try
            {
                await oDL.AddNewImage(image, contentImage, imageMarked);
            }
            catch (Exception ex)
            {
                _nLog.InsertLog(ex.Message, ex.StackTrace);
            }
        }

        /// <summary>
        /// Xử lý từ chối yêu cầu
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task HandleRejectRegisterRequest(string id, ServiceResult serviceResult)
        {
            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);

            var error = serviceResult.Error;

            RegisterReject registerReject = new RegisterReject()
            {
                RefID = id,
                ReasonReject = error
            };

            if (error == "Image has similar")
            {
                var listID = serviceResult.Data;
                IList ids = (IList)listID;

                var s = new StringBuilder();

                foreach (var item in ids)
                {
                    s.Append(item.ToString());
                    s.Append(";");
                }

                var imageID = s.ToString();
                imageID = imageID.Substring(0, imageID.Length - 1);

                s.Clear();

                registerReject.ImageSimilar = imageID;
            }

            await oDL.HandleRejectRegisterRequest(id, registerReject);
        }

        /// <summary>
        /// Xoá yêu cầu đk đã được chấp nhận
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task HandleDeleteRegisterRequest(string id)
        {
            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
            await oDL.HandleDeleteRegisterRequest(id);
        }

        /// <summary>
        /// Xoá các yêu cầu bị từ chối đăng ký
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> HandleDeleteRejectRegister(string id)
        {
            if (id == null)
            {
                return false;
            }

            List<string> ids = id.Split(';').ToList();
            if (ids.Count == 0)
            {
                return false;
            }

            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
            await oDL.HandleDeleteRejectRegister(ids);

            return true;
        }

        /// <summary>
        /// Xử lý kiểm tra xem ảnh đẫ có chữ ký hay chưa
        /// </summary>
        /// <param name="image"></param>
        public async Task<ServiceResult> HandlCheckCopyright(string image)
        {
            Dictionary<string, string> param = new Dictionary<string, string>();
            param.Add("image", image);

            var copyRightUrl = Configuration.GetSection("CopyrightOtherService").Value;
            var url = copyRightUrl + "/copyright/check";

            var result = await CallHTTPRequest.CallHttp(url, "POST", param);
            var serviceResult = JsonConvert.DeserializeObject<ServiceResult>(result.ToString());
            return serviceResult;
        }

        public async Task MoveRegisterToQueue()
        {
            FilterDefinition<RegisterRequestModel> filter = Builders<RegisterRequestModel>.Filter.Eq(x => x.Status, 0);
            CopyrightDL oDL = new CopyrightDL(Configuration);
            List<RegisterRequestModel> registers = await oDL.GetAllRegisterRequest(filter);

            if(registers != null && registers.Count > 0)
            {
                RegisterQueue registerQueue = new RegisterQueue(Configuration);
                foreach (var item in registers)
                {
                    RegisterRequest registerRequest = new RegisterRequest() { ID = item.RefID, Sign = item.UserPublicKey, Image = item.ImageContent };
                    registerQueue.PushObjectToQueue(registerRequest);
                }
            }

        }

        /// <summary>
        /// Kháng cáo yêu cầu bị từ chối
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> HandleAddAppealRequest(string id)
        {
            if (id == null)
            {
                return false;
            }

            List<string> ids = id.Split(';').ToList();
            if (ids.Count == 0)
            {
                return false;
            }

            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
            await oDL.HandleAddAppealRequest(ids);

            return true;
        }

        /// <summary>
        /// Từ chối yêu cầu kháng cáo
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> HandleRejectAppealRequest(string id)
        {
            if (id == null)
            {
                return false;
            }

            List<string> ids = id.Split(';').ToList();
            if (ids.Count == 0)
            {
                return false;
            }

            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
            await oDL.HandleRejectAppealRequest(ids);

            return true;
        }

        /// <summary>
        /// Từ chối yêu cầu kháng cáo
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> HandleAcceptAppealRequest(string id, string key)
        {
            CopyrightDL oDL = new CopyrightDL(Configuration);
            var request = await oDL.GetAppealRequest(id);
            if(request == null)
            {
                return false;
            }

            var imageContent = request.ImageContent;

            Dictionary<string, string> param = new Dictionary<string, string>();
            param.Add("sign", key);
            param.Add("image", imageContent);

            var copyRightUrl = Configuration.GetSection("CopyrightOtherService").Value;
            var url = copyRightUrl + "/copyright/accept";

            var result = await CallHTTPRequest.CallHttp(url, "POST", param);

            var serviceResult = JsonConvert.DeserializeObject<ServiceResult>(result.ToString());
            if (!serviceResult.Success)
            {
                return false;
            }

            var dataRegister = JsonConvert.DeserializeObject<RegisterContent>(serviceResult.Data.ToString());

            await AddNewCopyrightImage(key, dataRegister.Caption, dataRegister.Image, dataRegister.ImageMark);

            RegisterRequestDL oRequestDL = new RegisterRequestDL(Configuration);
            List<string> ids = new List<string>() { id };
            await oRequestDL.HandleRejectAppealRequest(ids);
            return true;
        }
    }

    public class RegisterRequest
    {
        public string ID { get; set; }
        public string Sign { get; set; }
        public string Image { get; set; }
    }

    public class CheckRequest
    {
        public string Image { get; set; }
    }

    public class RegisterContent
    {
        public string Image { get; set; }
        public string ImageMark { get; set; }
        public string Caption { get; set; }
    }
}
