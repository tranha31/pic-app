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

        [BsonElement("RefID")]
        public string RefID { get; set; }

        [BsonElement("UserPublicKey")]
        public string UserPublicKey { get; set; }

        [BsonElement("Status")]
        public int Status { get; set; }

        [BsonElement("ImageContent")]
        public string ImageContent { get; set; }

        [BsonElement("DateTime")]
        public DateTime CreatedDate { get; set; }
        
        [BsonElement("Error")]
        public string Error { get; set; }
    }
}
