using BE.PICBIN.DL.Entities;
using BE.PICBIN.Notification.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.Notification.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NotificationController : Controller
    {
        private readonly IHubContext<HubNotification> _messageHub;

        public NotificationController(IHubContext<HubNotification> messageHub)
        {
            _messageHub = messageHub;
        }

        [HttpPost("push/notification")]
        public async Task<IActionResult> TestPushNotification(Notificontent message)
        {
            await _messageHub.Clients.All.SendAsync("ReceiveMessage", message);

            return Ok();
        }
    }
}
