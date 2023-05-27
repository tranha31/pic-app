using BE.PICBIN.DL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.Notification.Hubs
{
    public interface IHubNotification
    {
        Task ReceiveMessage(Notificontent message);
    }

}
