using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace BE.PICBIN.BL
{
    public class CallHTTPRequest
    {
        private static readonly HttpClient client = new HttpClient();

        public CallHTTPRequest() {}

        public static async Task<object> CallHttp(string url, string method, string apiKey, object param = null)
        {
            client.DefaultRequestHeaders.Add("x-api-key", apiKey);
            var result = new object();
            if (method == "GET")
            {
                var response = await client.GetStringAsync(url);
                result = JsonConvert.DeserializeObject(response);
            }
            else if (method == "POST")
            {
                var json = JsonConvert.SerializeObject(param);
                var data = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(url, data);
                result = response.Content.ReadAsStringAsync().Result;
            }

            return result;
        }
    }
}
