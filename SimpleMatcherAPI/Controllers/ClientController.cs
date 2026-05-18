using Microsoft.AspNetCore.Mvc;
using SimpleMatcherAPI.Models;

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    private readonly MongoService _mongoService;

    public ClientController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _mongoService.GetClientsAsync();
        return Ok(clients);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClient(
        [FromBody] Client client
    )
    {
        await _mongoService.CreateClientAsync(client);

        return Ok("Client created!");
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetClient(
        string username
    )
    {
        var client = await _mongoService
            .GetClientByUsername(username);

        if (client == null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [HttpGet("{username}/requests")]
    public async Task<IActionResult>
        GetClientRequests(string username)
    {
        var requests = await _mongoService
            .GetRequestsByClient(username);

        return Ok(requests);
    }
}