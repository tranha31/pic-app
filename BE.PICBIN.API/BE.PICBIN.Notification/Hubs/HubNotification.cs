using BE.PICBIN.DL.Entities;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.Notification.Hubs
{
    public class HubNotification : Hub
    {
        public async Task SendMessage(Notificontent message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
