using Microsoft.AspNetCore.Mvc;
using SimpleMatcherAPI.Models;

[ApiController]
[Route("api/[controller]")]
public class RequestController : ControllerBase
{
    private readonly MongoService _mongoService;

    public RequestController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRequests()
    {
        var requests = await _mongoService.GetRequestsAsync();
        return Ok(requests);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] ClientRequest request)
    {
        await _mongoService.CreateRequestAsync(request);

        return Ok("Request created!");
    }
}