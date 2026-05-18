public class ArtistMatchDto
{
    public string username { get; set; }
    public List<string> artStyle { get; set; } = new();
    public List<string> specification { get; set; } = new();
    public float minBudget { get; set; }
    public float maxBudget { get; set; }
    public List<string> communication { get; set; } = new();
    public int capacity { get; set; }
    public string management { get; set; }
}

public class ClientMatchDto
{
    public string username { get; set; }
    public List<string> artStyle { get; set; } = new();
    public List<string> specification { get; set; } = new();
    public float maxBudget { get; set; }
    public List<string> communication { get; set; } = new();
    public string management { get; set; }
    public int urgency { get; set; }
}

public class MatchRequestDto
{
    public List<ArtistMatchDto> artists { get; set; } = new();
    public ClientMatchDto client { get; set; }
}