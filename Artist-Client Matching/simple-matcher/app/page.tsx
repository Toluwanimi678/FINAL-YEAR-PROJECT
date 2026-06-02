"use client";

import bg from "../public/generalBg.jpg";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if anyone is logged in
    const client = localStorage.getItem("client");
    const artist = localStorage.getItem("artist");
    if (client || artist) setIsLoggedIn(true);

    // Fetch all artist profiles
    const fetchArtists = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/artist-profiles"
        );
        if (!response.ok) return;
        const data = await response.json();
        setArtists(data);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      }
    };

    fetchArtists();
  }, []);

  const selectRole = (role: string) => {
    localStorage.setItem("role", role);
    router.push("/pages/sign-up");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* HERO SECTION */}
      <div className="bg-[#346771] flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-white text-4xl font-bold mb-2">
          Welcome to InspireArt
        </h1>
        <p className="text-gray-200 mb-8">
          Connect with artists or find clients for your work
        </p>
        <h2 className="text-white mb-6 text-xl">Are you...</h2>
        <div className="flex gap-6 w-full max-w-3xl">
          <div
            onClick={() => selectRole("artist")}
            className="flex-1 bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2">An Artist</h3>
            <p className="text-gray-600 text-sm">
              Showcase your work and get commissions
            </p>
          </div>
          <div
            onClick={() => selectRole("client")}
            className="flex-1 bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2">A Client</h3>
            <p className="text-gray-600 text-sm">
              Find artists and request custom artwork
            </p>
          </div>
        </div>
      </div>

      {/* ARTIST GALLERY */}
      <div className="bg-black/60 flex-1 px-8 py-12">
        <h2 className="text-white text-3xl font-bold text-center mb-2">
          Meet Our Artists
        </h2>
        <p className="text-zinc-400 text-center mb-10">
          Browse talented artists on InspireArt
        </p>

        {artists.length === 0 ? (
          <p className="text-zinc-400 text-center">
            No artists yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {artists.map((artist, index) => (
              <div
                key={index}
                className="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg"
              >
                {/* AVATAR */}
                <div className="w-16 h-16 rounded-full bg-zinc-600 mb-4" />

                <h3 className="text-xl font-bold">@{artist.username}</h3>

                <p className="text-zinc-400 text-sm mt-1 mb-4">
                  {artist.bio || "No bio yet."}
                </p>

                <p>
                  <span className="font-semibold text-sm text-zinc-400">
                    Styles:{" "}
                  </span>
                  <span className="text-pink-300">
                    {artist.artStyle?.join(", ") || "N/A"}
                  </span>
                </p>

                <p className="mt-1">
                  <span className="font-semibold text-sm text-zinc-400">
                    Budget:{" "}
                  </span>
                  ₦{artist.minBudget ?? 0} - ₦{artist.maxBudget ?? 0}
                </p>

                <p className="mt-1">
                  <span className="font-semibold text-sm text-zinc-400">
                    Status:{" "}
                  </span>
                  {artist.capacity &&
                  (artist.currentActiveCommissions || 0) < artist.capacity ? (
                    <span className="text-green-400">🟢 Open</span>
                  ) : (
                    <span className="text-red-400">🔴 Busy</span>
                  )}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() =>
                      router.push(`/pages/artist/${artist.username}`)
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl text-sm"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        router.push("/pages/sign-in");
                      } else {
                        router.push(`/pages/artist/${artist.username}`);
                      }
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-xl text-sm"
                  >
                    {isLoggedIn ? "Commission" : "Sign in to Commission"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}