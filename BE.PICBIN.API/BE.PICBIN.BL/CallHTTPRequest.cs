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

        public static async Task<object> CallHttp(string url, string method, Dictionary<string, object> param = null )
        {
            var result = new object();
            if (method == "GET")
            {
                var response = await client.GetStringAsync(url);
                result = JsonConvert.DeserializeObject(response);
            }
            else if (method == "POST")
            {
                var content = new FormUrlEncodedContent((IEnumerable<KeyValuePair<string, string>>)param);
                var response = await client.PostAsync(url, content);
                result = response.Content.ReadAsStringAsync().Result;
            }

            return result;
        }
    }
}
