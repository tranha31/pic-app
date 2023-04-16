using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace RegisterWorker
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        public RegisterHandler _registerHandler = null;

        public Worker(ILogger<Worker> logger, IConfiguration configuration)
        {
            _logger = logger;
            var registerConfig = configuration.GetSection("RegisterQueue");
            var uri = registerConfig.GetSection("Uri").Value;

            var factory = new ConnectionFactory { Uri = new Uri(uri) };
            var connection = factory.CreateConnection();
            var queueName = registerConfig.GetSection("Name").Value;

            _registerHandler = new RegisterHandler(connection, configuration, queueName);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await _registerHandler.ExcuteRequest();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

        }
    }
}
