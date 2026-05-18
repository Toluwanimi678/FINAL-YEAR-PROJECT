using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SimpleMatcherAPI.Models
{
    public class ClientRequest
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public required string Username { get; set; }

        [BsonElement("artStyle")]
        public List<string>? ArtStyle { get; set; }

        [BsonElement("specification")]
        public List<string>? Specification { get; set; }

        [BsonElement("maxBudget")]
        public int? MaxBudget { get; set; }

        [BsonElement("communication")]
        public List<string>? Communication { get; set; }

        [BsonElement("urgency")]
        public int? Urgency { get; set; }

        [BsonElement("management")]
        public string? Management { get; set; }

        [BsonElement("status")]
        public string? Status { get; set; } = "pending";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        [BsonElement("matchedArtist")]
        public string? MatchedArtist { get; set; }
    }
}