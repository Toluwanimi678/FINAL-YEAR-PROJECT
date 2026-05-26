using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
public class CommissionRequest
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    [BsonElement("ArtistUsername")]
    public string ArtistUsername { get; set; }
    [BsonElement("ClientUsername")]
    public string ClientUsername { get; set; }
    [BsonElement("MaxBudget")]
    public double MaxBudget { get; set; }
    [BsonElement("Urgency")]
    public int Urgency { get; set; }
    [BsonElement("ArtStyle")]
    public List<string> ArtStyle { get; set; }

    // 👇 ADD THESE
    [BsonElement("Specification")]
    public List<string> Specification { get; set; } = new();
    [BsonElement("Communication")]
    public List<string> Communication { get; set; } = new();
    [BsonElement("Management")]
    public string? Management { get; set; }

    [BsonElement("Status")]
    public string Status { get; set; } = "Pending";
    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}