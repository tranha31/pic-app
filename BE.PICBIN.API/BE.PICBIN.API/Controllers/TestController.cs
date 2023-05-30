using BE.PICBIN.API.Authentication;
using BE.PICBIN.BL;
using BE.PICBIN.DL.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TestController : Controller
    {
        private readonly IConfiguration _config;

        public TestController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> TestConnectCopyrightManager()
        {
            var bl = new TestBL(_config);
            var result = await bl.TestConnectCopyrightManger();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> TestPush()
        {
            var bl = new TestBL(_config);
            await bl.TestPush();
            return Ok();
        }
    }
}
