"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtistProfile } from "../../services/types";


export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const router = useRouter();
  const [sentArtist, setSentArtist] = useState<string | null>(null);
 

  useEffect(() => {
  const storedMatches = localStorage.getItem("matches");

  if (storedMatches) {
    const parsed = JSON.parse(storedMatches);
    console.log("MATCHES FROM STORAGE:", parsed); // 👈 check what's actually in there
    setMatches(Array.isArray(parsed) ? parsed : []);
  }
}, []);

  interface CommissionRequest {
    artistUsername: string;
    clientUsername: string;
    maxBudget: number;
    urgency: string;
    artStyle: string[];
    status?: string;
  }
const sendCommissionRequest = async (
  artist: ArtistProfile,
  match: any
) => {  try {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      alert("You are not logged in as a client.");
      return;
    }

    const client = JSON.parse(storedClient);
    const storedRequest = localStorage.getItem("requestData");

    if (!storedRequest) {
      alert("No request data found.");
      return;
    }

    const requestData = JSON.parse(storedRequest);

    console.log("REQUEST DATA:", requestData);

    const requestPayload = {
      artistUsername: artist.username,
      clientUsername: client.username,

      maxBudget: requestData.maxBudget,
      urgency: requestData.urgency,
      artStyle: requestData.artStyle,
      specification: requestData.specification ?? [], 
      communication: requestData.communication ?? [], 
      management: requestData.management ?? "flexible", 
    };

    console.log("SENDING:", requestPayload);

    const response = await fetch(
      "http://localhost:5000/api/commission-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      throw new Error("Failed to send request");
    }

    // ✅ show success state
    setSentArtist(artist.username);

    // redirect after short delay
    setTimeout(() => {
      router.push(`/pages/client/${client.username}`);
    }, 1000);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

  return (
    <div
      className="min-h-screen bg-cover bg-center p-8"
      style={{
        backgroundImage: `url('/generalBg.jpg')`,
      }}
    >
      <div className="bg-black/60 min-h-screen p-6 rounded-2xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Your Matches
        </h1>

        {matches.length === 0 ? (
          <p className="text-white text-center">
            No matches found.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div
                key={index}
                className="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg"
              >
                <img
                  src={match.artist.portfolioImages?.[0]}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  alt = {"artist's art"}
                />
                <h2 className="text-2xl font-bold mb-3">
                  {match.artist.username}
                </h2>

                <p>
                  <span className="font-semibold">
                    Art Styles:
                  </span>{" "}
                  {match.artist.artStyle?.join(", ")}
                </p>

                <p>
                  <span className="font-semibold">
                    Specifications:
                  </span>{" "}
                  {match.artist.specification?.join(", ")}
                </p>

                <p>
                  <span className="font-semibold">
                    Communication:
                  </span>{" "}
                  {match.artist.communication?.join(", ")}
                </p>

                <p>
                  <span className="font-semibold">
                    Budget:
                  </span>{" "}
                  ₦{match.artist.minBudget} - ₦
                  {match.artist.maxBudget}
                </p>

                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">
                      Compatibility
                    </span>

                    <span className="text-sm">
                      {match.score}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-600 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${match.score}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                      `/pages/artist/${match.artist.username}?score=${match.score}`
                    )
                    }
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded-xl"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => sendCommissionRequest(match.artist, match)}
                    className="mt-2 w-full bg-purple-600 hover:bg-purple-700 transition p-2 rounded-xl"
                  >
                    Send Commission Request
                  </button>

                  {sentArtist === match.artist.username && (
                    <div className="text-green-400 mt-2">
                      Request sent successfully ✔
                    </div>
                  )}                                
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}