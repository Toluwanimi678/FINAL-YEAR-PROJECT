const BASE_URL = "http://localhost:5000";
type Match = {
  client: string;
  artist: string;
};

let artists: any[] = [];
let clients: any[] = [];

export const signupArtist = async (data: any) => {
  const res = await fetch("http://localhost:5000/api/artists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};

export async function addArtistProfile(profile: any) {
  await fetch(`${BASE_URL}/api/artistprofile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
}

export async function addClient(client: any) {
  await fetch(`${BASE_URL}/api/client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });
}

export async function addRequest(request: any) {
  await fetch(`${BASE_URL}/api/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export async function matchRequest(data: any) {
  const res = await fetch("http://localhost:5000/match-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

   if (!res.ok) {
    const text = await res.text();
    console.error("Server error:", text);
    throw new Error("Request failed");
  }

  return res.json();
}

export function resetData() {
  artists = [];
  clients = [];
}

export async function getMatches() {
  const response = await fetch(`${BASE_URL}/match`);

  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }

  return response.json();

}