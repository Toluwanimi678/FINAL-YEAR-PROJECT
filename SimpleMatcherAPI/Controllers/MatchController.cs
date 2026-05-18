using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SimpleMatcherAPI.Data;
using SimpleMatcherAPI.Models;
using System.Text;
using System.Text.Json;

namespace SimpleMatcherAPI.Controllers
{
    [ApiController]
    [Route("api")]
    public class MatchController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public MatchController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

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


        // ➕ Add Artist
        [HttpPost("artists")]
        public async Task<IActionResult> AddArtist([FromBody] Artist artist)
        {
            await _mongoService.CreateArtistAsync(artist);
            return Ok(artist);
        }

        // ➕ Add Client (Signup only)
        [HttpPost("clients")]
        public IActionResult AddClient([FromBody] Client client)
        {
            DataStore.Clients.Add(client);
            return Ok(client);
        }

        // 🎯 MATCH A SINGLE REQUEST
        [HttpPost("match-request")]
        public async Task<IActionResult> MatchRequest([FromBody] ClientRequest request)
        {
            Console.WriteLine(JsonSerializer.Serialize(request));
            using var httpClient = new HttpClient();
            var artists = await _mongoService.GetArtistsAsync();
            var payload = new
            {
                artists = artists,
                client = request
            };

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("http://127.0.0.1:8000/match-one", content);

            var result = await response.Content.ReadAsStringAsync();

            return Content(result, "application/json");
        }

        [HttpPost]
        /*public async Task<IActionResult> MatchRequest([FromBody] ClientRequest request)
        {
            // Save request
            await _clientRequestService.CreateAsync(request);

            // Retrieve artists
            var artists = await _artistProfileService.GetAllAsync();

            // Match
            var bestMatch = _matchingService.FindBestMatch(request, artists);

            // Return result
            if (bestMatch == null)
            {
                return NotFound(new
                {
                    message = "No suitable artist found."
                });
            }

            return Ok(bestMatch);
        }*/

        // 🔄 Reset
        [HttpPost("reset")]
        public IActionResult Reset()
        {
            DataStore.Artists.Clear();
            DataStore.Clients.Clear();
            return Ok();
        }
        
    }
}