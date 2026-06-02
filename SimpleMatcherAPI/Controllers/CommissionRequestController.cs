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
        request.Status = "Pending";

        // Cancel any existing pending requests from this client
        var filter = Builders<CommissionRequest>.Filter.And(
            Builders<CommissionRequest>.Filter.Eq(r => r.ClientUsername, request.ClientUsername),
            Builders<CommissionRequest>.Filter.Eq(r => r.Status, "Pending")
        );
        var update = Builders<CommissionRequest>.Update.Set(r => r.Status, "Cancelled");
        await _mongoService.UpdateCommissionRequest(filter, update);

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
        var filter = Builders<CommissionRequest>.Filter.And(
            Builders<CommissionRequest>.Filter.Eq(r => r.Id, id),
            Builders<CommissionRequest>.Filter.In(r => r.Status, new[] { "Pending", "Matched" })
        );

        var update = Builders<CommissionRequest>.Update
            .Set(r => r.Status, "Accepted");

        var result = await _mongoService.UpdateCommissionRequest(filter, update);

        if (result.MatchedCount == 0)
            return NotFound(new { message = "Request not found or already accepted" });

        // 👇 Fetch the request to get the artist username, then increment
        var accepted = await _mongoService.GetAllCommissionRequests();
        var request = accepted.FirstOrDefault(r => r.Id == id);

        if (request != null)
            await _mongoService.IncrementActiveCommissionsAsync(request.ArtistUsername);

        return Ok(new { message = "Request accepted" });
    }

    [HttpGet("debug/commission")]
    public async Task<IActionResult> Debug()
    {
        var all = await _mongoService.GetAllCommissionRequests();


        return Ok(all);
    }

    [HttpDelete("commission-requests/{id}")]
    public async Task<IActionResult> DeleteRequest(string id)
    {
        await _mongoService.DeleteCommissionRequestAsync(id);
        return Ok(new { message = "Request deleted" });
    }

    [HttpPut("commission-requests/reject/{id}")]
    public async Task<IActionResult> RejectRequest(string id)
    {
        var filter = Builders<CommissionRequest>.Filter.And(
            Builders<CommissionRequest>.Filter.Eq(r => r.Id, id),
            Builders<CommissionRequest>.Filter.In(r => r.Status, new[] { "Pending", "Matched" })
        );

        var update = Builders<CommissionRequest>.Update
            .Set(r => r.Status, "Rejected");

        var result = await _mongoService.UpdateCommissionRequest(filter, update);

        if (result.MatchedCount == 0)
            return NotFound(new { message = "Request not found or already resolved" });

        return Ok(new { message = "Request rejected" });
    }

}