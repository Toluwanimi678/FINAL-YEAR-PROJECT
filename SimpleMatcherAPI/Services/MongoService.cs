using MongoDB.Driver;
using SimpleMatcherAPI.Models;

public class MongoService
{
    private readonly IMongoCollection<Artist> _artists;
    private readonly IMongoCollection<ArtistProfile> _artistProfiles;
    private readonly IMongoCollection<Client> _clients;
    private readonly IMongoCollection<ClientRequest> _requests;

    public MongoService(IMongoDatabase database)
    {
        _artists = database.GetCollection<Artist>("artists");
        _artistProfiles = database.GetCollection<ArtistProfile>("artistProfiles");
        _clients = database.GetCollection<Client>("clients");
        _requests = database.GetCollection<ClientRequest>("requests");

    }

    public async Task<List<Artist>> GetArtistsAsync()
    {
        return await _artists.Find(_ => true).ToListAsync();
    }

    public async Task CreateArtistAsync(Artist artist)
    {
        await _artists.InsertOneAsync(artist);
    }

    public async Task CreateArtistProfileAsync(ArtistProfile profile)
    {
        await _artistProfiles.InsertOneAsync(profile);
    }

    public async Task<List<ArtistProfile>> GetArtistProfilesAsync()
    {
        return await _artistProfiles.Find(_ => true).ToListAsync();
    }

    public async Task CreateClientAsync(Client client)
    {
        await _clients.InsertOneAsync(client);
    }

    public async Task<List<Client>> GetClientsAsync()
    {
        return await _clients.Find(_ => true).ToListAsync();
    }

    public async Task CreateRequestAsync(ClientRequest request)
    {
        await _requests.InsertOneAsync(request);
    }

    public async Task<List<ClientRequest>> GetRequestsAsync()
    {
        return await _requests.Find(_ => true).ToListAsync();
    }

    public async Task<ArtistProfile?> GetArtistByUsername(string username)
    {
        return await _artistProfiles
            .Find(a => a.Username == username)
            .FirstOrDefaultAsync();
    }

    public async Task<Artist?> GetArtistUser(
    string username,
    string password
)
    {
        return await _artists
            .Find(a =>
                a.Username == username &&
                a.Password == password
            )
            .FirstOrDefaultAsync();
    }

    public async Task<Client?> GetClientUser(
    string username,
    string password
)
    {
        return await _clients
            .Find(c =>
                c.Username == username &&
                c.Password == password
            )
            .FirstOrDefaultAsync();
    }

    public async Task<Client?> GetClientByUsername(string username)
    {
        return await _clients
            .Find(c => c.Username == username)
            .FirstOrDefaultAsync();
    }

    public async Task<List<ClientRequest>>
    GetRequestsByClient(string username)
    {
        return await _requests
            .Find(r => r.Username == username)
            .ToListAsync();
    }

}