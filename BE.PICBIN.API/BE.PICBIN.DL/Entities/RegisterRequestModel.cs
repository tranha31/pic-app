using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace BE.PICBIN.DL.Entities
{
    public class RegisterRequestModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ID { get; set; }
        public string RefID { get; set; }
        public string UserPublicKey { get; set; }
        public int Status { get; set; }
        public string ImageContent { get; set; }
    }
}
