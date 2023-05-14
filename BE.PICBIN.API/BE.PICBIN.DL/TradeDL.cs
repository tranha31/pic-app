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

        #region Sell

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

        public List<MarketItem> GetListSellPaging(string key, string searchKey, int start, int length, int mode, DateTime? fromDate = null, DateTime? toDate = null, int? typeOrder = 0)
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
                    where += $" LOWER(m.Caption) LIKE LOWER(@Search{i}) OR ";

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
                sql = $"SELECT * FROM marketitem m WHERE m.UserPublicKey = @PublicKey AND (m.CreatedDate BETWEEN @FromDate AND @ToDate) {where} ORDER BY m.ModifiedDate DESC LIMIT @Start, @Length;";

            }
            else
            {
                string orderBy = "m.ModifiedDate DESC";
                if(typeOrder == 1)
                {
                    orderBy = "m.Price DESC";
                }

                if (!string.IsNullOrEmpty(where))
                {
                    where = " WHERE " + where.Substring(4);
                }
                sql = $"SELECT * FROM marketitem m {where} ORDER BY {orderBy} LIMIT @Start, @Length;";

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

        #endregion

        #region Auction

        public void UpdateAuctionRoom(int mode, string itemID, string key, string imageID, DateTime fromDate, DateTime toDate, decimal startPrice)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("Mode", mode);
            parameters.Add("ImageID", imageID);
            parameters.Add("Key", key);
            parameters.Add("FromDate", fromDate);
            parameters.Add("ToDate", toDate);
            parameters.Add("Price", startPrice);
            parameters.Add("ItemID", itemID);

            var procName = "Proc_AuctionRoom_Update";
            List<string> listOutPut = null;

            ExcuteProcMySQL(procName, parameters, ref listOutPut);
        }

        public List<AuctionRoomDetail> GetAuctionRoomDetail(string itemID)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ID", itemID);

            var sql = "SELECT * FROM auctiondetail a WHERE a.AuctionRoomID = @ID";

            List<string> listOutPut = null;

            var data = QueryCommandMySQL<AuctionRoomDetail>(sql, parameters, ref listOutPut);
            if (data != null)
            {
                var lstResult = new List<AuctionRoomDetail>(data);
                return lstResult;
            }

            return null;
        }

        public List<AuctionRoom> GetListAuctionRoomPaging(string key, int start, int length, DateTime fromDate, DateTime toDate, int mode)
        {
            List<AuctionRoom> lstResult;

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@Start", start);
            parameters.Add($"@Length", length);
            parameters.Add($"@PublicKey", key);
            parameters.Add($"@FromDate", fromDate);
            parameters.Add($"@ToDate", toDate);

            List<string> listOutPut = null;

            string sql;
            if (mode == 0)
            {
                sql = $"SELECT * FROM auctionroom m WHERE m.OwnerPublicKey = @PublicKey AND ((m.StartTime BETWEEN @FromDate AND @ToDate) OR (m.EndTime BETWEEN @FromDate AND @ToDate)) ORDER BY m.StartTime LIMIT @Start, @Length;";
            }
            else
            {
                sql = $"SELECT * FROM auctionroom m WHERE ((m.StartTime BETWEEN @FromDate AND @ToDate) OR (m.EndTime BETWEEN @FromDate AND @ToDate)) ORDER BY m.StartTime LIMIT @Start, @Length;";
            }

            var result = QueryCommandMySQL<AuctionRoom>(sql, parameters, ref listOutPut);
            if (result != null)
            {
                lstResult = new List<AuctionRoom>(result);
                return lstResult;
            }

            return null;
        }

        public AuctionRoom GetAuctionRoomByID(string id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ItemID", id);

            var sql = "SELECT * FROM auctionroom a WHERE a.ID = @ItemID";

            List<string> listOutPut = null;

            var data = QueryCommandMySQL<AuctionRoom>(sql, parameters, ref listOutPut);
            if (data != null)
            {
                var lstResult = new List<AuctionRoom>(data);
                if(lstResult.Count > 0)
                {
                    return lstResult[0];
                }
            }

            return null;
        }

        public bool HandleDeleteAuctionRoom(string id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add($"@ItemID", id);


            List<string> listOutPut = null;

            var result = ExcuteProcMySQL("Proc_AuctionRoom_Delete", parameters, ref listOutPut);
            return result;
        }

        #endregion
    }
}
