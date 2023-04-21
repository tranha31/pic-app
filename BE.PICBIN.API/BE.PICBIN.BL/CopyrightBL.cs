using BE.PICBIN.DL;
using BE.PICBIN.DL.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
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
        /// <param name="sign"></param>
        /// <param name="content"></param>
        public void HanleAddNewRegisterRequest(string sign, string content)
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
                    Status = 0
                };

                RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
                try
                {
                    oDL.HandleInsertNewRegister(model);
                }
                catch(Exception ex)
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
            catch(Exception ex)
            {
                _nLog.InsertLog(ex.Message, ex.StackTrace);
            }
        }

        /// <summary>
        /// Xử lý từ chối yêu cầu
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task HandleRejectRegisterRequest(string id)
        {
            RegisterRequestDL oDL = new RegisterRequestDL(Configuration);
            await oDL.HandleRejectRegisterRequest(id);
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
    }

    public class RegisterRequest
    {
        public string ID { get; set; }
        public string Sign { get; set; }
        public string Image { get; set; }
    }
}
