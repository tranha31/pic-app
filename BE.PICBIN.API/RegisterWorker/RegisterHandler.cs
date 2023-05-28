using BE.PICBIN.BL;
using BE.PICBIN.BL.Enities;
using BE.PICBIN.DL;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace RegisterWorker
{
    public class RegisterHandler
    {
        public IConnection _connection { get; set; }
        public IModel channel { get; set; }

        public IConfiguration _configuration { get; set; }

        public string _queueName { get; set; }

        public NLog _nLog { get; set; }

        public RegisterHandler(IConnection connection, IConfiguration configuration, string queueName)
        {
            _connection = connection;
            _configuration = configuration;

            _queueName = queueName;
            channel = connection.CreateModel();

            channel.QueueDeclare(queue: queueName,
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

            _nLog = new NLog(configuration);
        }

        public async Task ExcuteRequest()
        {
            var consumer = new EventingBasicConsumer(channel);

            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                await ProcessRequest(message);
                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);

            };

            channel.BasicConsume(queue: _queueName,
                                 autoAck: false,
                                 consumer: consumer);
        }

        /// <summary>
        /// Xử lý request
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task ProcessRequest(string message)
        {
            try
            {
                if (!string.IsNullOrEmpty(message))
                {
                    RegisterRequest data = JsonConvert.DeserializeObject<RegisterRequest>(message);
                    Dictionary<string, string> param = new Dictionary<string, string>();
                    param.Add("sign", data.Sign.ToString());
                    param.Add("image", data.Image.ToString());

                    var copyRightUrl = _configuration.GetSection("CopyrightManager").Value;
                    var url = copyRightUrl + "/copyright/add";

                    var result = await CallHTTPRequest.CallHttp(url, "POST", param);

                    var serviceResult = JsonConvert.DeserializeObject<ServiceResult>(result.ToString());
                    if (serviceResult.Success)
                    {
                        var dataRegister = JsonConvert.DeserializeObject<RegisterContent>(serviceResult.Data.ToString());
                        CopyrightBL oBL = new CopyrightBL(_configuration);

                        await oBL.AddNewCopyrightImage(data.Sign, dataRegister.Caption, dataRegister.Image, dataRegister.ImageMark);

                        await oBL.HandleDeleteRegisterRequest(data.ID);
                    }
                    else
                    {
                        CopyrightBL oBL = new CopyrightBL(_configuration);
                        await oBL.HandleRejectRegisterRequest(data.ID, serviceResult, data.Sign);
                    }
                }

            }
            catch (Exception ex)
            {
                _nLog.InsertLog(ex.Message, ex.StackTrace);
            }
        }


    }

    public class RegisterContent
    {
        public string Image { get; set; }
        public string ImageMark { get; set; }
        public string Caption { get; set; }
    }
}
