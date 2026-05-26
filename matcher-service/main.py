from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict

app = FastAPI()

# -------- MODELS --------

class ArtistProfile(BaseModel):
    username: str
    artStyle: List[str]
    specification: List[str]
    minBudget: float
    maxBudget: float
    communication: List[str]
    capacity: int
    management: str

    class Config:
        populate_by_name = True

class Client(BaseModel):
    username: str
    specification: List[str]
    artStyle: List[str]
    maxBudget: float
    communication: List[str]
    management: str
    urgency: int

    class Config:
        populate_by_name = True

class BatchMatchRequest(BaseModel):
    artists: List[ArtistProfile]
    clients: List[Client]


# -------- SCORING --------
# Used by BOTH sides to build their preference lists

def score_match(artist: ArtistProfile, client: Client) -> int:
    score = 0

    # Art Style
    if any(style in artist.artStyle for style in client.artStyle):
        score += 35

    # Specification
    if any(spec in artist.specification for spec in client.specification):
        score += 25

    # Budget
    if (artist.minBudget is not None and
        artist.maxBudget is not None and
        client.maxBudget is not None):
        if artist.minBudget <= client.maxBudget <= artist.maxBudget:
            score += 20

    # Communication
    if any(c in artist.communication for c in client.communication):
        score += 10

    # Management
    if artist.management == client.management:
        score += 5

    # Urgency / Capacity
    if client.urgency <= 5 or artist.capacity > 1:
        score += 5

    return score


# -------- GALE-SHAPLEY --------

def gale_shapley(
    artists: List[ArtistProfile],
    clients: List[Client]
) -> Dict[str, str]:
    """
    Client-proposing Gale-Shapley.
    Returns a dict of { client_username: artist_username }
    Artists can hold multiple matches up to their capacity.
    """

    # Build preference lists using score_match
    client_prefs: Dict[str, List[str]] = {}
    for client in clients:
        ranked = sorted(
            [a for a in artists if a.capacity > 0],
            key=lambda a: score_match(a, client),
            reverse=True
        )
        client_prefs[client.username] = [a.username for a in ranked]

    artist_prefs: Dict[str, List[str]] = {}
    for artist in artists:
        ranked = sorted(
            clients,
            key=lambda c: score_match(artist, c),
            reverse=True
        )
        artist_prefs[artist.username] = [c.username for c in ranked]

    # Track capacity per artist
    artist_capacity: Dict[str, int] = {
        a.username: a.capacity for a in artists
    }

    # { artist_username: [list of currently matched client usernames] }
    artist_matches: Dict[str, List[str]] = {
        a.username: [] for a in artists
    }

    # { client_username: artist_username }
    client_match: Dict[str, str] = {}

    # Index of next artist each client will propose to
    next_proposal: Dict[str, int] = {
        c.username: 0 for c in clients
    }

    free_clients = [c.username for c in clients]

    while free_clients:
        client = free_clients.pop(0)
        prefs = client_prefs.get(client, [])

        if next_proposal[client] >= len(prefs):
            # Client has exhausted all options — leave unmatched
            continue

        artist = prefs[next_proposal[client]]
        next_proposal[client] += 1

        current_matches = artist_matches[artist]
        capacity = artist_capacity[artist]

        if len(current_matches) < capacity:
            # Artist has room — tentatively accept
            artist_matches[artist].append(client)
            client_match[client] = artist

        else:
            # Artist is full — compare this client to their worst current match
            artist_ranking = artist_prefs[artist]

            def rank(c_name):
                return artist_ranking.index(c_name) if c_name in artist_ranking else 999

            worst_current = max(current_matches, key=rank)

            if rank(client) < rank(worst_current):
                # Artist prefers new client — swap out the worst
                artist_matches[artist].remove(worst_current)
                artist_matches[artist].append(client)
                client_match[client] = artist

                # Worst current client is now free again
                del client_match[worst_current]
                free_clients.append(worst_current)
            else:
                # Artist prefers their current matches — client stays free
                free_clients.append(client)

    return client_match


# -------- ENDPOINTS --------

@app.post("/match-batch")
def match_batch(data: BatchMatchRequest):
    """
    Runs Gale-Shapley across a full pool of clients and artists.
    Returns each client's match and their compatibility score.
    """
    matches = gale_shapley(data.artists, data.clients)

    result = []
    for client in data.clients:
        matched_artist_username = matches.get(client.username)

        if matched_artist_username:
            artist_obj = next(
                (a for a in data.artists if a.username == matched_artist_username),
                None
            )
            score = score_match(artist_obj, client) if artist_obj else 0

            result.append({
                "clientUsername": client.username,
                "artist": artist_obj.model_dump() if artist_obj else None,
                "score": score,
                "matched": True
            })
        else:
            result.append({
                "clientUsername": client.username,
                "artist": None,
                "score": 0,
                "matched": False
            })

    return result


@app.post("/match-one")
def match_one(data: BatchMatchRequest):
    """
    Kept for backwards compatibility with your existing frontend.
    Treats a single client as the pool and returns top scored artists.
    Upgrade your frontend to use /match-batch for true Gale-Shapley.
    """
    client = data.clients[0] if data.clients else None
    if not client:
        return []

    results = []
    for artist in data.artists:
        if artist.capacity <= 0:
            continue
        score = score_match(artist, client)
        results.append({"artist": artist.model_dump(), "score": score})

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:3]

# to load=> uvicorn main:app --reload 