using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
public class CommissionRequest
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("artistUsername")]
    public string ArtistUsername { get; set; }

    [BsonElement("clientUsername")]
    public string ClientUsername { get; set; }

    [BsonElement("maxBudget")]
    public double MaxBudget { get; set; }

    [BsonElement("urgency")]
    public int Urgency { get; set; }

    [BsonElement("artStyle")]
    public List<string> ArtStyle { get; set; }

    [BsonElement("specification")]
    public List<string> Specification { get; set; } = new();

    [BsonElement("communication")]
    public List<string> Communication { get; set; } = new();

    [BsonElement("management")]
    public string? Management { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Pending";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}