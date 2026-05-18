using MongoDB.Driver;
using SimpleMatcherAPI.Models;

public class ClientRequestService
{
    private readonly IMongoCollection<ClientRequest> _requests;

    public ClientRequestService(IMongoDatabase database)
    {
        _requests = database.GetCollection<ClientRequest>("ClientRequests");
    }

    public async Task CreateAsync(ClientRequest request)
    {
        await _requests.InsertOneAsync(request);
    }
}