using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.BL
{
    public class RegisterQueue
    {
        private ConnectionFactory factory = null;

        public IConnection connection { get; set; }

        public IModel channel { get; set; }

        public string queueName { get; set; }

        public string exchange { get; set; }

        public RegisterQueue(IConfiguration configuration)
        {
            var registerConfig = configuration.GetSection("RegisterQueue");
            var host = registerConfig.GetSection("Host").Value;
            var port = int.Parse(registerConfig.GetSection("Port").Value);
            var username = registerConfig.GetSection("User").Value;
            var password = registerConfig.GetSection("Password").Value;

            queueName = registerConfig.GetSection("Name").Value;
            exchange = registerConfig.GetSection("Exchange").Value;

            var uri = $"amqp://{username}:{password}@{host}:{port}/";

            factory = new ConnectionFactory { Uri = new Uri(uri) };
            connection = factory.CreateConnection();
            channel = connection.CreateModel();

            channel.QueueDeclare(queue: queueName,
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);
        }

        /// <summary>
        /// Đẩy vào queue
        /// </summary>
        /// <param name="registerRequest"></param>
        public void PushObjectToQueue(RegisterRequest registerRequest)
        {
            var message = JsonConvert.SerializeObject(registerRequest);
            var body = Encoding.UTF8.GetBytes(message);

            channel.BasicPublish(exchange: string.Empty,
                     routingKey: queueName,
                     basicProperties: null,
                     body: body);
        }


    }
}
