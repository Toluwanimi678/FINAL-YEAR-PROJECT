using Microsoft.AspNetCore.Mvc;
using SimpleMatcherAPI.Models;

namespace SimpleMatcherAPI.Controllers
{
    [ApiController]
    [Route("api/artists")]
    public class ArtistController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public ArtistController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<ArtistProfile>> GetArtist(string username)
        {
            var artist = await _mongoService.GetArtistByUsername(username);

            if (artist == null)
            {
                return NotFound("Artist not found");
            }

            return Ok(artist);
        }
    }
}