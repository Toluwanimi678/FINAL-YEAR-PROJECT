namespace SimpleMatcherAPI.Models
{
    public class Match
    {
        public required string Client { get; set; }
        public required string Artist { get; set; }
    }
    public class MatchRequest
    {
        public required List<Client> Clients { get; set; }
        public required List<Artist> Artists { get; set; }
    }
}