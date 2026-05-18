using MongoDB.Driver;
using SimpleMatcherAPI.Models;

public class ArtistProfileService
{
    private readonly IMongoCollection<ArtistProfile> _profiles;

    public ArtistProfileService(IMongoDatabase database)
    {
        _profiles = database.GetCollection<ArtistProfile>("ArtistProfiles");
    }

    public async Task<List<ArtistProfile>> GetAllAsync()
    {
        return await _profiles.Find(_ => true).ToListAsync();
    }
}