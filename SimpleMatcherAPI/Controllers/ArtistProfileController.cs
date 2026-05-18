using Microsoft.AspNetCore.Mvc;
using SimpleMatcherAPI.Models;

[ApiController]
[Route("api/[controller]")]
public class ArtistProfileController : ControllerBase
{
    private readonly MongoService _mongoService;

    public ArtistProfileController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfiles()
    {
        var profiles = await _mongoService.GetArtistProfilesAsync();
        return Ok(profiles);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProfile([FromBody] ArtistProfile profile)
    {
        await _mongoService.CreateArtistProfileAsync(profile);
        return Ok("Profile created!");
    }
}