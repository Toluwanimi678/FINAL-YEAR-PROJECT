from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

app = FastAPI()

# 📦 Models
class ArtistAuth(BaseModel):
    username: str
    email: str
    password: str

class ArtistProfile(BaseModel):
    username : str
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


class MatchRequest(BaseModel):
    artists: List[ArtistProfile]
    client: Client


# 🧠 Matching Logic
@app.post("/match-one")
def match_one(data: MatchRequest):

    artists = data.artists
    client = data.client

    best_matches = []

    for artist in artists:

        if artist.capacity <= 0:
            continue

        score = 0

        # Art Style
        if any(style in artist.artStyle for style in client.artStyle):
            score += 35

        # Specification
        if any(spec in artist.specification for spec in client.specification):
            score += 25

        # Budget
        min_b = artist.minBudget
        max_b = artist.maxBudget
        client_b = client.maxBudget

        if min_b is not None and max_b is not None and client_b is not None:
            if min_b <= client_b <= max_b:
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

        best_matches.append({
            "artist": artist.model_dump(),
            "score": score
        })

        best_matches.sort(key=lambda x: x["score"], reverse=True)

        return best_matches[:3]

    

# to run: uvicorn main:app --reload