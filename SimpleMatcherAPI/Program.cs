using MongoDB.Driver;
using SimpleMatcherAPI.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;

// Add services
var builder = WebApplication.CreateBuilder(args);

var mongoConnection = builder.Configuration["MongoDB:ConnectionString"];
var mongoDatabase = builder.Configuration["MongoDB:DatabaseName"];

builder.Services.AddSingleton<IMongoClient>(
    new MongoClient(mongoConnection));

builder.Services.AddSingleton(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(mongoDatabase);
});

builder.Services.AddSingleton<MongoService>();

builder.Services.AddControllers();



builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
builder.Services.AddSingleton<MongoService>();


var app = builder.Build();

app.MapControllers();

// Use CORS
app.UseCors("AllowFrontend");

// Dev tools
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseStaticFiles();

// ✅ ADD YOUR MATCH ENDPOINT HERE
var artists = new List<Artist>();
var clients = new List<Client>();

app.MapPost("/artists", (Artist artist) =>
{
    artists.Add(artist);
    return Results.Ok(artist);
});

app.MapPost("/clients", (Client client) =>
{
    clients.Add(client);
    return Results.Ok(client);
});

app.MapPost("/requests", (Client request) =>
{
    clients.Add(request);
    return Results.Ok();
});



app.MapPost("/match-request", async (
    ClientRequest request,
    MongoService mongoService
) =>
{
    using var httpClient = new HttpClient();

    // 1. SAVE REQUEST FIRST
    await mongoService.CreateRequestAsync(request);

    // 2. GET ALL ARTIST PROFILES
    var profiles = await mongoService.GetArtistProfilesAsync();

    // 2b. NORMALIZE DATA FOR PYTHON (IMPORTANT FIX)
    var formattedProfiles = profiles.Select(p => new
    {
        username = p.Username,
        artStyle = p.ArtStyle,
        specification = p.Specification,
        minBudget = p.MinBudget,
        maxBudget = p.MaxBudget,
        communication = p.Communication,
        capacity = p.Capacity,
        management = p.Management
    });



    // 3. BUILD PAYLOAD FOR PYTHON
    var payload = new
    {
        artists = formattedProfiles,
        client = request
    };

    var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    });

    var content = new StringContent(
        json,
        Encoding.UTF8,
        "application/json"
    );

    // 4. CALL PYTHON MATCHING ENGINE
    var response = await httpClient.PostAsync(
        "http://127.0.0.1:8000/match-one",
        content
    );

    var result = await response.Content.ReadAsStringAsync();

    // 5. RETURN RESULT
    return Results.Content(result, "application/json");
});

app.Run();