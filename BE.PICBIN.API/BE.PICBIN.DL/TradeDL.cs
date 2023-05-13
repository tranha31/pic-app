using BE.PICBIN.DL.Entities;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BE.PICBIN.DL
{
    public class TradeDL : DLBase
    {
        public string MongoDBName = "picbin_repo";
        public string registerRequestCollection = "RegisterRequest";
        public string appealRequestCollection = "AppealRequest";

        public TradeDL(IConfiguration configuration) : base(configuration)
        {
            SetMongoDB(MongoDBName);
        }

        public void AddNewSellImage(int mode, string itemID, string key, string id, string name, string detail, decimal price)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("Mode", mode);
            parameters.Add("ImageID", id);
            parameters.Add("Key", key);
            parameters.Add("Caption", name);
            parameters.Add("Detail", detail);
            parameters.Add("Price", price);
            parameters.Add("ID", itemID);

            var procName = "Proc_MarketItem_Update";
            List<string> listOutPut = null;

            ExcuteProcMySQL(procName, parameters, ref listOutPut);
        }

        public List<MarketItem> GetListSellPaging(string key, string searchKey, int start, int length, DateTime fromDate, DateTime toDate, int mode)
        {
            List<MarketItem> lstResult;

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Start", start);
            parameters.Add($"@Length", length);
            parameters.Add($"@PublicKey", key);
            parameters.Add($"@FromDate", fromDate);
            parameters.Add($"@ToDate", toDate);

            var where = string.Empty;
            if (!string.IsNullOrEmpty(searchKey))
            {
                var lstSearch = searchKey.Split(' ').ToList();
                where = " AND ( ";

                for (var i = 0; i < lstSearch.Count; i++)
                {
                    parameters.Add($"@Search{i}", "%" + lstSearch[i] + "%");
                    where += $" m.Caption LIKE @Search{i} OR ";

                    if (i == lstSearch.Count - 1)
                    {
                        where = where.Substring(0, where.Length - 3);
                        where += " ) ";
                    }
                }
            }

            List<string> listOutPut = null;

            string sql;
            if(mode == 0)
            {
                sql = $"SELECT * FROM marketitem m WHERE m.UserPublicKey = @PublicKey AND (m.CreatedDate BETWEEN @FromDate AND @ToDate) {where} ORDER BY m.ModifiedDate LIMIT @Start, @Length;";

            }
            else
            {
                sql = $"SELECT * FROM marketitem m WHERE m.UserPublicKey <> @PublicKey AND (m.CreatedDate BETWEEN @FromDate AND @ToDate) {where} ORDER BY m.ModifiedDate LIMIT @Start, @Length;";
            }

            var result = QueryCommandMySQL<MarketItem>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                lstResult = new List<MarketItem>(result);
                return lstResult;
            }

            return null;
        }

        public bool HandleDeleteSell(string id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ItemID", id);
            

            List<string> listOutPut = null;

            var result = ExcuteProcMySQL("Proc_MarketItem_Delete", parameters, ref listOutPut);
            return result;
        }

        public MarketItem GetMarketItemByID(string id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ID", id);

            var sql = "SELECT * FROM marketitem m WHERE m.ID = @ID";

            List<string> listOutPut = null;

            var data = QueryCommandMySQL<MarketItem>(sql, parameters, ref listOutPut);
            if(data != null)
            {
                var lstResult = new List<MarketItem>(data);
                if(lstResult.Count > 0)
                {
                    return lstResult[0];
                }
            }

            return null;
        }
    }
}
