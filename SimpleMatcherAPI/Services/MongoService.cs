using MongoDB.Driver;
using SimpleMatcherAPI.Models;

public class MongoService
{
    private readonly IMongoCollection<Artist> _artists;
    private readonly IMongoCollection<ArtistProfile> _artistProfiles;
    private readonly IMongoCollection<Client> _clients;
    private readonly IMongoCollection<ClientRequest> _requests;
    private readonly IMongoCollection<CommissionRequest> _commissionRequests;

    public MongoService(IMongoDatabase database)
    {
        _artists = database.GetCollection<Artist>("artists");
        _artistProfiles = database.GetCollection<ArtistProfile>("artistProfiles");
        _clients = database.GetCollection<Client>("clients");
        _requests = database.GetCollection<ClientRequest>("requests");
        _commissionRequests =
    database.GetCollection<CommissionRequest>("CommissionRequests");


    }

    // ---------------- ARTISTS ----------------

    public async Task<List<Artist>> GetArtistsAsync()
    {
        return await _artists.Find(_ => true).ToListAsync();
    }

    public async Task CreateArtistAsync(Artist artist)
    {
        await _artists.InsertOneAsync(artist);
    }

    // ---------------- ARTIST PROFILES ----------------

    public async Task CreateArtistProfileAsync(ArtistProfile profile)
    {
        await _artistProfiles.InsertOneAsync(profile);
    }

    public async Task<List<ArtistProfile>> GetArtistProfilesAsync()
    {
        return await _artistProfiles.Find(_ => true).ToListAsync();
    }

    public async Task<ArtistProfile?> GetArtistByUsernameAsync(string username)
    {
        return await _artistProfiles
            .Find(a => a.Username.ToLower() == username.ToLower()) // 👈 normalize
            .FirstOrDefaultAsync();
    }

    // ---------------- CLIENTS ----------------

    public async Task CreateClientAsync(Client client)
    {
        await _clients.InsertOneAsync(client);
    }

    public async Task<List<Client>> GetClientsAsync()
    {
        return await _clients.Find(_ => true).ToListAsync();
    }

    public async Task<Client?> GetClientUser(string username, string password)
    {
        return await _clients
            .Find(c => c.Username == username && c.Password == password)
            .FirstOrDefaultAsync();
    }

    public async Task<Client?> GetClientByUsername(string username)
    {
        return await _clients
            .Find(c => c.Username == username)
            .FirstOrDefaultAsync();
    }

    // ---------------- REQUESTS ----------------

    public async Task CreateRequestAsync(ClientRequest request)
    {
        await _requests.InsertOneAsync(request);
    }

    public async Task<List<ClientRequest>> GetRequestsAsync()
    {
        return await _requests.Find(_ => true).ToListAsync();
    }

    public async Task<List<ClientRequest>> GetRequestsByClient(string username)
    {
        return await _requests
            .Find(r => r.Username == username)
            .ToListAsync();
    }

    // ✅ FIXED: artist request lookup uses MatchedArtist
    public async Task<List<ClientRequest>> GetRequestsForArtistAsync(string username)
    {
        return await _requests
            .Find(r => r.MatchedArtist == username)
            .ToListAsync();
    }

    public async Task CreateCommissionRequest(
    CommissionRequest request)
    {
        await _commissionRequests.InsertOneAsync(request);
    }

    public async Task<List<CommissionRequest>> GetArtistRequests(string username)
    {
        var filter = Builders<CommissionRequest>.Filter.Eq(
            r => r.ArtistUsername,
            username
        );

        return await _commissionRequests
            .Find(filter)
            .ToListAsync();
    }

    // ---------------- LOGIN HELPERS ----------------

    public async Task<Artist?> GetArtistUser(string username, string password)
    {
        return await _artists
            .Find(a => a.Username == username && a.Password == password)
            .FirstOrDefaultAsync();
    }

    //------------------UPDATE COMMISSION--------------
    public async Task<UpdateResult> UpdateCommissionRequest(
    FilterDefinition<CommissionRequest> filter,
    UpdateDefinition<CommissionRequest> update)
    {
        return await _commissionRequests.UpdateOneAsync(filter, update);
    }

    public async Task<List<CommissionRequest>> GetAllCommissionRequests()
    {
        return await _commissionRequests.Find(_ => true).ToListAsync();
    }

    public async Task<List<CommissionRequest>> GetClientRequests(string username)
    {
        return await _commissionRequests
            .Find(r =>
                r.ClientUsername.Trim().ToLower() ==
                username.Trim().ToLower()
            )
            .ToListAsync();
    }

    public async Task<List<CommissionRequest>> GetCommissionRequestsForArtist(string username)
    {
        return await _commissionRequests
            .Find(r => r.ArtistUsername.Trim().ToLower() == username.Trim().ToLower())
            .ToListAsync();
    }

    // Get all artist profiles (for matching)
    public async Task<List<ArtistProfile>> GetAllArtistProfilesAsync()
    {
        return await _artistProfiles.Find(_ => true).ToListAsync();
    }

    // Get all unmatched commission requests
    public async Task<List<CommissionRequest>> GetUnmatchedRequestsAsync()
    {
        // First find all clients who already have an active match
        var activeStatuses = new[] { "Matched", "Accepted" };

        var matchedClients = await _commissionRequests
            .Find(r => activeStatuses.Contains(r.Status))
            .Project(r => r.ClientUsername)
            .ToListAsync();

        // Then return only pending requests from clients not already matched
        
        return await _commissionRequests
            .Find(r => r.Status == "Pending")
            .ToListAsync();
    
}

    // Save the matched artist back to a commission request
    public async Task SaveMatchResultAsync(string clientUsername, string artistUsername)
    {
        var filter = Builders<CommissionRequest>.Filter.And(
            Builders<CommissionRequest>.Filter.Eq(r => r.ClientUsername, clientUsername),
            Builders<CommissionRequest>.Filter.Eq(r => r.Status, "Pending")
        );

        var update = Builders<CommissionRequest>.Update
       .Set(r => r.ArtistUsername, artistUsername.ToLower()) 
       .Set(r => r.Status, "Matched");


        await _commissionRequests.UpdateOneAsync(filter, update);
    }

    public async Task DeleteCommissionRequestAsync(string id)
    {
        var filter = Builders<CommissionRequest>.Filter.Eq(r => r.Id, id);
        await _commissionRequests.DeleteOneAsync(filter);
    }

    public async Task IncrementActiveCommissionsAsync(string artistUsername)
    {
        var filter = Builders<ArtistProfile>.Filter.Eq(
            a => a.Username, artistUsername
        );
        var update = Builders<ArtistProfile>.Update
            .Inc(a => a.CurrentActiveCommissions, 1);

        await _artistProfiles.UpdateOneAsync(filter, update);
    }
}