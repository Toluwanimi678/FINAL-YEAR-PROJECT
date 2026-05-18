using Microsoft.AspNetCore.Mvc;
using SimpleMatcherAPI.Models;

namespace SimpleMatcherAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public AuthController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
           [FromBody] LoginRequest request
       )
        {
            if (request.Role == "artist")
            {
                var artist = await _mongoService
                    .GetArtistUser(
                        request.Username,
                        request.Password
                    );

                if (artist == null)
                {
                    return Unauthorized(
                        "Invalid credentials"
                    );
                }

                return Ok(new
                {
                    username = artist.Username,
                    role = "artist"
                });
            }
            var client = await _mongoService
                .GetClientUser(
                    request.Username,
                    request.Password
                );

            if (client == null)
            {
                return Unauthorized(
                    "Invalid credentials"
                );
            }

            return Ok(new
            {
                username = client.Username,
                role = "client"
            });
        }
    }
}


