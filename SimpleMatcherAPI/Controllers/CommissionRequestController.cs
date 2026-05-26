using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SimpleMatcherAPI.Models;

[ApiController]
[Route("api")]
public class CommissionRequestsController : ControllerBase
{
    private readonly MongoService _mongoService;

    public CommissionRequestsController(
        MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpPost("commission-requests")]
    public async Task<IActionResult> CreateRequest(
    [FromBody] CommissionRequest request)
    {
        request.Status = "Pending"; // 👈 force it regardless of what frontend sends
        await _mongoService.CreateCommissionRequest(request);
        return Ok(new { message = "Request sent successfully" });
    }

    [HttpGet("commission-requests/client/{username}")]
    public async Task<IActionResult> GetArtistRequests(
        string username)
    {
        var requests = await _mongoService.GetClientRequests(username);

        return Ok(requests);
    }

    [HttpPut("commission-requests/accept/{id}")]
    public async Task<IActionResult> AcceptRequest(string id)
    {
        // 1. Filter: match by ID and only if still Pending
        var filter = Builders<CommissionRequest>.Filter.And(
            Builders<CommissionRequest>.Filter.Eq(r => r.Id, id),
            Builders<CommissionRequest>.Filter.Eq(r => r.Status, "Pending"),
            Builders<CommissionRequest>.Filter.In(r => r.Status, new[] { "Pending", "Matched" }));

        // 2. What to change
        var update = Builders<CommissionRequest>.Update
            .Set(r => r.Status, "Accepted");

        // 3. Run it and capture the result
        var result = await _mongoService.UpdateCommissionRequest(filter, update);

        // 4. If nothing matched, the ID was wrong or it was already accepted
        if (result.MatchedCount == 0)
            return NotFound(new { message = "Request not found or already accepted" });

        return Ok(new { message = "Request accepted" });
    }

    [HttpGet("debug/commission")]
    public async Task<IActionResult> Debug()
    {
        var all = await _mongoService.GetAllCommissionRequests();


        return Ok(all);
    }


}