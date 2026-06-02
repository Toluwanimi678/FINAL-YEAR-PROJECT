using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SimpleMatcherAPI.Models
{
    public class ArtistProfile
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

        [BsonElement("minBudget")]
        public double? MinBudget { get; set; }

        [BsonElement("maxBudget")]
        public double? MaxBudget { get; set; }

        [BsonElement("communication")]
        public List<string>? Communication { get; set; }

        [BsonElement("capacity")]
        public int? Capacity { get; set; }

        [BsonElement("management")]
        public string? Management { get; set; }

        [BsonElement("bio")]
        public string? Bio { get; set; }

        [BsonElement("profilePicture")]
        public string? ProfilePicture { get; set; }

        [BsonElement("artworkGallery")]
        public List<string>? ArtworkGallery { get; set; }

        [BsonElement("currentActiveCommissions")]
        public int? CurrentActiveCommissions { get; set; }
    }
}