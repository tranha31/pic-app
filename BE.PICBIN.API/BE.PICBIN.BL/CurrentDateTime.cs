using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.BL
{
    public class CurrentDateTime
    {
        public IConfiguration Configuration { get; }

        public CurrentDateTime(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public DateTime GetCurrentDateTime()
        {
            var hours = Configuration.GetSection("DifferenceHours").Value;
            var value = int.Parse(hours);
            return DateTime.Now.AddHours(value);
        }
    }
}
