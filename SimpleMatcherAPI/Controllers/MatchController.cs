using Microsoft.AspNetCore.Mvc;
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
        // ---------------- ARTISTS ----------------
        [HttpPost("artists")]
        public async Task<IActionResult> AddArtist([FromBody] Artist artist)
        {
            await _mongoService.CreateArtistAsync(artist);
            return Ok(artist);
        }
        // ---------------- CLIENTS ----------------
        [HttpPost("clients")]
        public async Task<IActionResult> AddClient([FromBody] Client client)
        {
            await _mongoService.CreateClientAsync(client);
            return Ok(client);
        }
        // ---------------- MATCHING ----------------
        [HttpPost("match-request")]
        public async Task<IActionResult> MatchRequest([FromBody] ClientRequest request)
        {
            using var httpClient = new HttpClient();
            var artists = await _mongoService.GetArtistsAsync();
            var payload = new
            {
                artists,
                client = request
            };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync("http://127.0.0.1:8000/match-one", content);
            var result = await response.Content.ReadAsStringAsync();
            return Content(result, "application/json");
        }
        // ---------------- BATCH MATCH ----------------
        [HttpPost("run-batch-match")]
        public async Task<IActionResult> RunBatchMatch()
        {
            // 1. Fetch all artist profiles and pending commission requests
            var artistProfiles = await _mongoService.GetAllArtistProfilesAsync();
            var pendingRequests = await _mongoService.GetUnmatchedRequestsAsync();

            if (!pendingRequests.Any())
                return Ok(new { message = "No pending requests to match." });

            if (!artistProfiles.Any())
                return Ok(new { message = "No artists available for matching." });

            // 2. Map CommissionRequests → Client shape Python expects
            var clients = pendingRequests.Select(r => new
            {
                username = r.ClientUsername,
                artStyle = r.ArtStyle ?? new List<string>(),
                specification = r.Specification ?? new List<string>(),
                maxBudget = r.MaxBudget,
                communication = r.Communication ?? new List<string>(),
                management = r.Management ?? "flexible",
                urgency = r.Urgency
            }).ToList();

            // 3. Map ArtistProfiles → Artist shape Python expects
            var artists = artistProfiles.Select(a => new
            {
                username = a.Username,
                artStyle = a.ArtStyle ?? new List<string>(),
                specification = a.Specification ?? new List<string>(),
                minBudget = a.MinBudget,
                maxBudget = a.MaxBudget,
                communication = a.Communication ?? new List<string>(),
                capacity = a.Capacity,
                management = a.Management ?? "flexible"
            }).ToList();

            // 4. Send to Python /match-batch
            using var httpClient = new HttpClient();
            var payload = new { artists, clients };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(
                "http://127.0.0.1:8000/match-batch",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Python error: " + error);
                return StatusCode(500, new { message = "Matching service failed.", detail = error });
            }

            var resultJson = await response.Content.ReadAsStringAsync();

            // 5. Deserialize results
            var results = JsonSerializer.Deserialize<List<BatchMatchResult>>(
                resultJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (results == null)
                return StatusCode(500, new { message = "Failed to parse match results." });

            // 6. Save each match back to MongoDB
            foreach (var result in results)
            {
                if (result.Matched && result.Artist != null)
                {
                    await _mongoService.SaveMatchResultAsync(
                        result.ClientUsername,
                        result.Artist.Username
                    );
                    Console.WriteLine(
                        $"Matched: {result.ClientUsername} → {result.Artist.Username} ({result.Score}%)"
                    );
                }
                else
                {
                    Console.WriteLine($"Unmatched: {result.ClientUsername}");
                }
            }

            return Ok(results);
        }
        // ---------------- PROFILE ----------------
        [HttpGet("artist-profiles/{username}")]
        public async Task<IActionResult> GetArtist(string username)
        {
            var artist = await _mongoService.GetArtistByUsernameAsync(username);
            if (artist == null)
                return NotFound();
            return Ok(artist);
        }
        // ---------------- ARTIST REQUESTS ----------------
        [HttpGet("commission-requests/artist/{username}")]
        public async Task<IActionResult> GetArtistRequests(string username)
        {
            Console.WriteLine($"ARTIST SEARCH: '{username}'");
            var requests = await _mongoService.GetCommissionRequestsForArtist(username);
            return Ok(requests);
        }

        [HttpGet("artist-profiles")]
        public async Task<IActionResult> GetAllArtists()
        {
            var artists = await _mongoService.GetAllArtistProfilesAsync();
            return Ok(artists);
        }
    }

    // DTO to deserialize Python's response
    public class BatchMatchResult
    {
        public string ClientUsername { get; set; } = "";
        public ArtistProfile? Artist { get; set; }
        public int Score { get; set; }
        public bool Matched { get; set; }
    }


}